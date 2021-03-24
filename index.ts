import * as ParseServer from "parse-server";
import * as serve from "./audiostream/serve"; 
import * as auth from "./audiostream/auth"; 
import * as express from "express";
import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import {Album} from "./data/Album";
import * as cloud from "./cloud/main";

Parse.Object.registerSubclass("Album", Album);

const app = express();

class ServerConfig{
    PARSE_APPNAME: string;
    PARSE_DATABASEURI: string;
    PARSE_APPID: string;
    PRASE_MASTERKEY: string;
    PARSE_SERVERURL: string;
    PARSE_MASTERKEY: string;
    PARSE_PUBLICSERVERURL: string;
    ROUTE: string;
    PORT: number;
}


function startServer() {
    var config : ServerConfig = new ServerConfig();
    try {
        config = require(__dirname + "/config.json");
    } catch (error) {
        console.log("Config not found in " + __dirname + "/config.json");
    }
    var api = new ParseServer.ParseServer({
        appName: process.env.PARSE_APPNAME || config.PARSE_APPNAME || "audiobook",
        databaseURI:
            process.env.PARSE_DATABASEURI || config.PARSE_DATABASEURI || "mongodb://mongo:27017/audiobook",
        appId: process.env.PARSE_APPID || config.PARSE_APPID || "ABCDEFG",
        masterKey: process.env.PARSE_MASTERKEY || config.PARSE_MASTERKEY || "ABCDEFG",
        serverURL: process.env.PARSE_SERVERURL || config.PARSE_SERVERURL || "http://localhost:1337/",
        publicServerURL:
            process.env.PARSE_PUBLICSERVERURL || config.PARSE_PUBLICSERVERURL || "http://127.0.0.1:1337/",
        allowHeaders: ["X-Parse-Installation-Id"],
        cloud: __dirname + "/cloud/main",
        allowClientClassCreation: false
    });
    app.use(auth.auth(
    process.env.PARSE_APPID || config.PARSE_APPID || "ABCDEFG"))
    app.use(process.env.ROUTE || config.ROUTE || "/", api);
    app.use("/stream", serve.serve)
    try {
        var privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
        var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

        var credentials = { key: privateKey, cert: certificate };
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(process.env.PORT || config.PORT || "1337");

    } catch (error) {
        var httpServer = http.createServer(app);
        httpServer.listen(process.env.PORT || config.PORT || "1337");

    }
}
startServer();