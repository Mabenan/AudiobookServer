var unirest = require("unirest");




module.exports = function (appID) {

    return function auth(req, res, next) {
        if (req.path.includes("stream")) {
            if (!req.headers["x-parse-session-token"]) {
                res.status(401).send("not authorized");
                return;
            }

            Parse.Cloud.httpRequest({
                url: Parse.serverURL + 'users/me',
                headers: {
                    'X-Parse-Application-Id': appID,
                    'X-Parse-Session-Token': req.headers["x-parse-session-token"]
                }
            }).then(function (userData) {
                req.user = Parse.Object.fromJSON(userData.data);
                next();
            }, function (error) {
                res.status(401).send("not authorized");
            });
        } else {
            next();
        }
    }
}