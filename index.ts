import * as serve from "./audiostream/serve"; 
import * as auth from "./audiostream/auth"; 
import {Album} from "./data/Album";
import { Track } from "./data/Track";
import { instance, InitProcess } from "server-manager-api";

Parse.Object.registerSubclass("Album", Album);
Parse.Object.registerSubclass("Track", Track);

module.exports = class Init implements InitProcess{
    init() {
        instance.APP.use(auth.auth("com.mabenan.catbooks"))
            instance.APP.use("/stream", serve.serve);
    }

}