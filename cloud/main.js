Parse.Cloud.define("analyseBooks", async(request) => {
    const config = await Parse.Config.get({useMasterKey: true});
    var src = config.get("audiobookLocation");
    return src;
},{
    requireUser: true
  });