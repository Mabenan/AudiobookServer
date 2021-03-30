var unirest = require("unirest");
import { Request, Response } from "express";
import { Cloud } from "parse";



export function auth(appID : string) {

    return function auth(req: Request, res: Response, next: CallableFunction) {
        if(req.method == "OPTIONS"){
            next();
            return;
        }
        if (req.path.includes("stream")) {
            if (!req.headers["x-parse-session-token"]) {
                res.status(401).send("not authorized");
                return;
            }

            Parse.Cloud.httpRequest({
                url: Parse.serverURL + 'users/me',
                headers: {
                    'X-Parse-Application-Id': appID,
                    'X-Parse-Session-Token': req.headers["x-parse-session-token"].toString()
                }
            }).then(function (userData) {
                next();
            }, function (error) {
                res.status(401).send("not authorized");
            });
        } else {
            next();
        }
    }
}