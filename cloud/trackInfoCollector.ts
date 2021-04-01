import async from "async";
  
import { Album } from "../data/Album";
import { Track } from "../data/Track";
import * as path from "path";
import * as fs from "fs";

export class TrackInfoCollector {

    
    collectTrackInfo(currentProc: Parse.Object) {
        return new Promise<void>(async (res, rej) => {
            const config = await Parse.Config.get({ useMasterKey: true });
            var src = config.get("audiobookLocation");
            var query = new Parse.Query<Track>("Track");
            query.equalTo("Hash", null).equalTo("Size", null);
            var tracks = await query.findAll({useMasterKey: true});
            var maxFileCount = tracks.length;
            currentProc.set("Progress", 0);
            await currentProc.save(null, { useMasterKey: true });
            async.forEachLimit(tracks, 200, async (track: Track, calb) => {
                var fileUri : string = track.File;
                var file : string = path.join(src,fileUri);
                track.Hash = require('crypto').createHash('sha1').update(fs.readFileSync(file)).digest('base64');
                track.Size = fs.statSync(file).size;
                await track.save(null, {useMasterKey: true});
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