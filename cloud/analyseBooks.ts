import { Object } from "parse";
import * as glob from "glob";
import { parseFile } from "music-metadata";
import * as path from "path";

export class BookAnalyse {


    analyseFiles(files: string[], src: string) {
        return new Promise<void>(async (res, rej) => {
            files.forEach((file) => {
                parseFile(path.join(src, file)).then((metadata) => {
                    console.log(metadata.common.album);
                });
            });
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
                currentProc.save();
            })
            .catch(() => {
                currentProc.set("running", false);
                currentProc.save();
            });
    }

}
