const auth = require("basic-auth"); //For authentication.
const { User } = require("../models");

//Authentication function that will be used to check whether the right user is logged in and to show that user the right information.
function authenticateUser(req, res, next) {
  const credentials = auth(req);
  if (credentials) {
    User.authenticate(credentials.name, credentials.pass, function(err, user) {
      if (err || !user) {
        let err = new Error("Wrong email address or password.");
        err.status = 401;
        return next(err);
      } else {
        req.doc = user;
        return next();
      }
    });
  } else {
    return next();
  }
}

module.exports.authenticateUser = authenticateUser;
