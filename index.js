
var express = require("express");
var ParseServer = require("parse-server").ParseServer;
var app = express();
var https = require("https");
var http = require("http");
var fs = require("fs");

var auth = require("./audiostream/auth");
var serve = require("./audiostream/serve");

function startServer(err) {
    var config = {};
    try {
        config = require(__dirname + "/config.json");
    } catch (error) {
        console.log("Config not found in " + __dirname + "/config.json");
    }
    var api = new ParseServer({
        appName: process.env.PARSE_APPNAME || config.PARSE_APPNAME || "audiobook",
        databaseURI:
            process.env.PARSE_DATABASEURI || config.PARSE_DATABASEURI || "mongodb://mongo:27017/audiobookdev",
        appId: process.env.PARSE_APPID || config.PARSE_APPID || "ABCDEFG",
        masterKey: process.env.PARSE_MASTERKEY || config.PARSE_MASTERKEY || "ABCDEFG",
        serverURL: process.env.PARSE_SERVERURL || config.PARSE_SERVERURL || "http://localhost:1337/",
        publicServerURL:
            process.env.PARSE_PUBLICSERVERURL || config.PARSE_PUBLICSERVERURL || "http://127.0.0.1:1337/",
        allowHeaders: ["X-Parse-Installation-Id"],
        cloud: __dirname + "/cloud/main.js",
        
    });
    Parse.Config.get({useMasterKey: true}).set("audiobookLocation", process.env.AUDIOBOOK_SRC || config.AUDIOBOOK_SRC || __dirname + "/audiobooks");
    app.use(auth(
    process.env.PARSE_APPID || config.PARSE_APPID || "ABCDEFG"))
    app.use(process.env.ROUTE || config.ROUTE || "/", api);
    app.use("/stream", serve)
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