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
    PARSE_MASTERKEY: string;
    PARSE_SERVERURL: string;
    PARSE_PUBLICSERVERURL: string;
    ROUTE: string;
    PORT: number;
    LOCALPORT: number;
}
function cliAddress(req: any) {
    return req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'];
  }

function startServer() {
    var config : ServerConfig = new ServerConfig();
    try {
        if(fs.existsSync(__dirname+"/config.json")){
        config = require(__dirname + "/config.json");
        }
    } catch (error) {
        console.log("Config not found in " + __dirname + "/config.json");
    }
    var api = new ParseServer.ParseServer({
        appName: process.env.PARSE_APPNAME || config.PARSE_APPNAME || "audiobook",
        databaseURI:
            process.env.PARSE_DATABASEURI || config.PARSE_DATABASEURI || "mongodb://mongo:27017/audiobookdev",
        appId: process.env.PARSE_APPID || config.PARSE_APPID || "ABCDEFG",
        masterKey: process.env.PARSE_MASTERKEY || config.PARSE_MASTERKEY || "ABCDEFG",
        serverURL: process.env.PARSE_SERVERURL || config.PARSE_SERVERURL || "http://localhost:13371/",
        publicServerURL:
            process.env.PARSE_PUBLICSERVERURL || config.PARSE_PUBLICSERVERURL || "http://127.0.0.1:1337/",
        allowHeaders: ["X-Parse-Installation-Id", "X-Parse-Application-Id"],
        cloud: __dirname + "/cloud/main",
        allowClientClassCreation: false
    });
    app.use(auth.auth(
    process.env.PARSE_APPID || config.PARSE_APPID || "ABCDEFG"))
    app.use(process.env.ROUTE || config.ROUTE || "/", api);
    app.use("/stream", serve.serve)
    try {
        var privateKey = fs.readFileSync(__dirname + '/sslcert/server.key', 'utf8');
        var certificate = fs.readFileSync(__dirname + '/sslcert/server.crt', 'utf8');

        var credentials = { key: privateKey, cert: certificate };
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(process.env.PORT || config.PORT || "1337");
        ParseServer.ParseServer.createLiveQueryServer(httpsServer);
        console.log("https started");

    } catch (error) {

    }
    var httpServer = http.createServer(function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if (!cliAddress(req).includes("127.0.0.1") 
    && cliAddress(req) !== "::1") // put the IP address here
        {
                res.end();
    
        }else{
            app(req,res);
        }
    
    });
    httpServer.listen(process.env.LOCALPORT || config.LOCALPORT || "13371");
    ParseServer.ParseServer.createLiveQueryServer(httpServer);
}
startServer();
