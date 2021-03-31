var unirest = require("unirest");
import { Request, Response } from "express";
import { Cloud } from "parse";



export function auth(appID : string) {

    return function auth(req: Request, res: Response, next: CallableFunction) {
        if (req.path.includes("stream")) {
            
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,HEAD');
            res.header('Access-Control-Allow-Headers', 'X-Parse-Master-Key, X-Parse-REST-API-Key, X-Parse-Javascript-Key, X-Parse-Application-Id, X-Parse-Client-Version, X-Parse-Session-Token, X-Requested-With, X-Parse-Revocable-Session, X-Parse-Request-Id, Content-Type, Pragma, Cache-Control, X-Parse-Installation-Id, X-Parse-Application-Id');
            res.header('Access-Control-Expose-Headers', 'X-Parse-Job-Status-Id, X-Parse-Push-Status-Id');
        if(req.method == "OPTIONS"){
            res.sendStatus(200);
            return;
        }
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
