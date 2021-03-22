import { BookAnalyse } from "./analyseBooks";

const fs = require("fs");
const glob = require("glob");
const path = require("path");
const mm = require("music-metadata");

function analyseBooks(currentProc : Parse.Object) {
  return new BookAnalyse().analyseBooks(currentProc);
}

Parse.Cloud.define(
  "analyseBooks",
  async (request: Parse.Cloud.FunctionRequest) => {
    if(request.user == null){
      return "not auth";
    }
    const processQuery = new Parse.Query("Processes");
    processQuery.equalTo("Name", "AnalyseBooks");
    const results = await processQuery.find();
    var currentProc;
    if (results.length <= 0) {
      currentProc = new Parse.Object("Processes");
      currentProc.set("Name", "AnalyseBooks");
    } else {
      currentProc = results[0];
    }

    if (currentProc.get("running")) {
      return "already running";
    } else {
      currentProc.set("running", true);
    }
    currentProc.save();
    analyseBooks(currentProc);
    return "process startet";
  });
