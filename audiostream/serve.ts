import { Request, Response } from "express";
import { lookup } from "mime-types";
import * as path from "path";
import * as fs from "fs";

export async function serve(req: Request, res: Response, next: CallableFunction) {
    const config = await Parse.Config.get({ useMasterKey: true });
    var src = config.get("audiobookLocation");
    var file : string = path.join(src,decodeURI(req.path).replace("stream/", ""));
    if(req.method == "GET"){
    res.setHeader("content-type", lookup(file).toString());
    fs.createReadStream(file).pipe(res);
    }
}