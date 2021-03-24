import { Object } from "parse";
import * as glob from "glob";
import { parseFile } from "music-metadata";
import * as path from "path";
import { Album } from "../data/Album";
import { Track } from "../data/Track";

export class BookAnalyse {


    analyseFiles(files: string[], src: string) {
        return new Promise<void>(async (res, rej) => {
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                var metadata = await parseFile(path.join(src, file));
                var albumQuery = new Parse.Query<Album>("Album");
                albumQuery.equalTo("Name", metadata.common.album);
                var albums = await albumQuery.find({ useMasterKey: true });
                var album : Album;
                if(albums.length == 1){
                    console.log("Album found");
                    album = albums[0];
                }else{
                    console.log("Album not found");
                    album = new Album();
                    album.Name = metadata.common.album;
                    album = await album.save(null,{ useMasterKey: true });
                }
                var trackQuery = new Parse.Query<Track>("Track");
                trackQuery.equalTo("File", file);
                if(await trackQuery.count({useMasterKey: true}) >= 1){
                    continue;
                }else{
                    var track = new Track();
                    track.Name = metadata.common.title;
                    track.Order = metadata.common.disk.no * 100 + metadata.common.track.no;
                    track.File = file;
                    track.Album = album;
                    track = await track.save(null, {useMasterKey: true});
                    album.Tracks.add(track);
                    await album.save(null, {useMasterKey: true});
                }
                
            }
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
                this.analyseFiles(match, src)
                    .then(() => res())
                    .catch((errr) => rej(err));
            });
        })
            .then(() => {
                currentProc.set("running", false);
                currentProc.save(null,{ useMasterKey: true });
            })
            .catch(() => {
                currentProc.set("running", false);
                currentProc.save(null,{ useMasterKey: true });
            });
    }

}
