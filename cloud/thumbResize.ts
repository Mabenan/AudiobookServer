import async from "async";
  
import sharp = require('sharp');
import { Album } from "../data/Album";

export class ThumbResize {

    
    resizeThumbs(currentProc: Parse.Object) {
        return new Promise<void>(async (res, rej) => {
            var albumQuery = new Parse.Query<Album>("Album");
            var albums = await albumQuery.findAll({useMasterKey: true});
            async.forEachLimit<Album>(albums, 100, (album, cb)=>{
                var img = Buffer.from(album.Cover, 'base64');
                sharp(img).resize(125,125).toBuffer()
                .then(resizedImageBuffer => {
                    let resizedImageData = resizedImageBuffer.toString('base64');
                    album.Cover = resizedImageData;
                    album.save(null, {useMasterKey:true});
                    cb();
                });
            }).then(() => res()).catch((erro)=>rej(erro));
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