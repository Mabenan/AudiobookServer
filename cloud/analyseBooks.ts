import { Object } from "parse";
import * as glob from "glob";
import { IAudioMetadata, parseFile, selectCover, parseStream } from "music-metadata";
import * as path from "path";
import { Album } from "../data/Album";
import { Track } from "../data/Track";
import * as fs from "fs";
import * as async from "async";

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class Meta {
    public album: Album;
    constructor(public metadata: IAudioMetadata, public file: string) { }
}

export class BookAnalyse {

    analyseFiles(files: string[], src: string, currentProc: Parse.Object) {
        return new Promise<void>(async (res, rej) => {
            var maxFileCount = files.length;
            currentProc.set("CurrentStep", 1);
            await currentProc.save(null, { useMasterKey: true });
            currentProc.set("Progress", 0);
            await currentProc.save(null, { useMasterKey: true });
            var metadatas: Meta[] = (await async.mapLimit<string, Meta>(files, 200, (value, back) => {
                parseFile(path.join(src, value)).catch((err) => {
                    currentProc.increment("Progress", (1 / maxFileCount) * 100);
                    currentProc.save(null, { useMasterKey: true });
                    console.log(err);
                    back(null, null);
                }).then((meta: IAudioMetadata) => {
                    currentProc.increment("Progress", (1 / maxFileCount) * 100);
                    currentProc.save(null, { useMasterKey: true });
                    back(null, new Meta(meta, value));
                });
            }).catch((err) => rej(err))) as Meta[];
            metadatas = metadatas.filter(meta => meta !== null);
            maxFileCount = metadatas.length;
            currentProc.set("CurrentStep", 2);
            await currentProc.save(null, { useMasterKey: true });
            currentProc.set("Progress", 0);
            await currentProc.save(null, { useMasterKey: true });
            metadatas = await async.mapLimit<Meta, Meta>(metadatas, 100, async (metadata, back) => {
                if (metadata.metadata.common.album === null
                    || metadata.metadata.common.album === undefined) {
                    metadata.metadata.common.album = metadata.metadata.common.title;
                }
                var albumQuery = new Parse.Query<Album>("Album");
                albumQuery.equalTo("Name", metadata.metadata.common.album);
                var albums = await albumQuery.find({ useMasterKey: true });
                if (albums.length == 1) {
                    metadata.album = albums[0];
                }
                currentProc.increment("Progress", (1 / maxFileCount) * 100);
                currentProc.save(null, { useMasterKey: true });
                back(null, metadata);
            })
            var stillToCreate = metadatas.filter(meta => meta.album === null || meta.album === undefined);
            maxFileCount = stillToCreate.length;
            currentProc.set("CurrentStep", 3);
            await currentProc.save(null, { useMasterKey: true });
            currentProc.set("Progress", 0);
            await currentProc.save(null, { useMasterKey: true });
            for (let index = 0; index < stillToCreate.length; index++) {
                const metadata = stillToCreate[index];
                if (metadata.metadata.common.album === null
                    || metadata.metadata.common.album === undefined) {
                    metadata.metadata.common.album = metadata.metadata.common.title;
                }
                var albumQuery = new Parse.Query<Album>("Album");
                albumQuery.equalTo("Name", metadata.metadata.common.album);
                var albums = await albumQuery.find({ useMasterKey: true });
                if (albums.length == 1) {
                    metadata.album = albums[0];
                } else {
                    metadata.album = new Album();
                    metadata.album.Name = metadata.metadata.common.album;
                    metadata.album = await metadata.album.save(null, { useMasterKey: true });
                }
                if (metadata.album.Cover === null
                    || metadata.album.Cover === undefined) {
                    var cover = selectCover(metadata.metadata.common.picture);
                    if (cover !== null) {
                        metadata.album.Cover = cover.data.toString('base64');
                    }
                    metadata.album = await metadata.album.save(null, { useMasterKey: true });
                }
                currentProc.increment("Progress", (1 / maxFileCount) * 100);
                await currentProc.save(null, { useMasterKey: true });
            }
            maxFileCount = metadatas.length;
            currentProc.set("CurrentStep", 4);
            await currentProc.save(null, { useMasterKey: true });
            currentProc.set("Progress", 0);
            await currentProc.save(null, { useMasterKey: true });
            await async.forEachOfLimit<Meta>(metadatas, 100, async (metadata, index: number, cb) => {
                try {
                    const file = metadata.file;
                    const album = metadata.album;
                    if (metadata == undefined ||
                        metadata.metadata.common.album == undefined) {
                        metadata.metadata.common.album = metadata.metadata.common.title;
                    }
                    var trackQuery = new Parse.Query<Album>("Track");
                    trackQuery.equalTo("File", file);
                    if (await trackQuery.count({ useMasterKey: true }) > 0) {
                        cb();
                        return;
                    }
                    var track = new Track();
                    track.Name = metadata.metadata.common.title;
                    track.Order = metadata.metadata.common.disk.no * 10000 + metadata.metadata.common.track.no;
                    track.File = file;
                    track.Album = album;
                    track = await track.save(null, { useMasterKey: true });
                    album.Tracks.add(track);
                    await album.save(null, { useMasterKey: true });
                    currentProc.increment("Progress", (1 / maxFileCount) * 100);
                    currentProc.save(null, { useMasterKey: true });
                    cb();
                } catch (error) {
                    console.log(error);
                    cb();
                }
            }).catch((err) => rej(err));
            res();
        });
    }
    analyseBooks(currentProc: Parse.Object) {
        return new Promise<void>(async (res, rej) => {
            const config = await Parse.Config.get({ useMasterKey: true });
            var src = config.get("audiobookLocation");
            var search =
                "{**/*.mp3,**/*.aiff,**/*.aac,**/*.ape,**/*.asf,**/*.dsdiff,**/*.dsf,**/*.flac,**/*.mp2,**/*.mka,**/*.mkv,**/*.mpc,**/*.mp4,**/*.m4a,**/*.m4v,**/*.ogg,**/*.opus,**/*.wav,**/*.wma}";
            glob(search, { nocase: true, cwd: src }, (err, match) => {
                this.analyseFiles(match, src, currentProc)
                    .then(() => res())
                    .catch((errr) => rej(err));
            });
        })
            .then(() => {
                currentProc.set("running", false);
                currentProc.save(null, { useMasterKey: true });
            })
            .catch((err) => {
                console.log(err);
                currentProc.set("running", false);
                currentProc.save(null, { useMasterKey: true });
            });
    }

}
