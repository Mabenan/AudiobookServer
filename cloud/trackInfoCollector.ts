import async from "async";

import { Album } from "../data/Album";
import { Track } from "../data/Track";
import * as path from "path";
import * as fs from "fs";
import { parseFile } from "music-metadata";

export class TrackInfoCollector {


    collectTrackInfo(currentProc: Parse.Object) {
        return new Promise<void>(async (res, rej) => {
            const config = await Parse.Config.get({ useMasterKey: true });
            var src = config.get("audiobookLocation");
            var query = new Parse.Query<Track>("Track");
            var tracks = await query.findAll({ useMasterKey: true });
            var maxFileCount = tracks.length;
            currentProc.set("Progress", 0);
            await currentProc.save(null, { useMasterKey: true });
            async.forEachLimit(tracks, 200, async (track: Track, calb) => {
                var fileUri: string = track.File;
                var file: string = path.join(src, fileUri);
                if (track.Hash == null
                    || track.Hash == undefined) {
                    track.Hash = require('crypto').createHash('sha1').update(fs.readFileSync(file)).digest('base64');
                }
                if (track.Size == null
                    || track.Size == undefined) {
                    track.Size = fs.statSync(file).size;
                }
                if(track.Length == null
                    || track.Length == undefined){
                        var metadata = await parseFile(file, { duration: true, skipCovers: true });
                        track.Length = metadata.format.duration;
                }
                await track.save(null, { useMasterKey: true });
                currentProc.increment("Progress", (1 / maxFileCount) * 100);
                await currentProc.save(null, { useMasterKey: true });
                calb();
            }).then(() => res()).catch((err) => rej(err));
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