import { Cloud } from "parse";
import { BookAnalyse } from "./analyseBooks";
import { ThumbResize } from "./thumbResize";
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const mm = require("music-metadata");

function analyseBooks(currentProc : Parse.Object) {
  return new BookAnalyse().analyseBooks(currentProc);
}

function resizeThumbs(currentProc : Parse.Object) {
  return new ThumbResize().resizeThumbs(currentProc);
}

Parse.Cloud.job("analyseBooks", (req) => {
  runProcess("AnalyseBooks", analyseBooks);
  return new Promise<void>((res,rej)=>{
    res();
  })
})

Parse.Cloud.job("resizeThumbs", (req) => {
  runProcess("ResizeThumbs", resizeThumbs);
  return new Promise<void>((res,rej)=>{
    res();
  })
})

async function runProcess(name: string, cb: CallableFunction): Promise<string>{
  const processQuery = new Parse.Query("Processes");
  processQuery.equalTo("Name", name);
  const results = await processQuery.find({useMasterKey: true});
  var currentProc;
  if (results.length <= 0) {
    currentProc = new Parse.Object("Processes");
    currentProc.set("Name", name);
  } else {
    currentProc = results[0];
  }

  if (currentProc.get("running")) {
    return "already running";
  } else {
    currentProc.set("running", true);
  }
  currentProc.save(null,{useMasterKey: true}).catch((err) => console.log(err));
  cb(currentProc);
  return "process startet";
  
}

Parse.Cloud.define(
  "analyseBooks",
  async (request: Parse.Cloud.FunctionRequest) => {
    if(request.user == null){
      return "not auth";
    }
    return runProcess("AnalyseBooks", analyseBooks);
  });
