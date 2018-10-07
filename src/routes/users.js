const express = require("express"); //Express
const router = express.Router(); //Router
const { User } = require("../models"); //UserSchema
const auth = require("basic-auth"); //Authentication get users route
const mid = require("../middleware"); //Require middleware functions

//Get route for users that authenticates user by using their credentials to also ref the right json to show for the user.
router.get("/", mid.authenticateUser, function(req, res, next) {
  const credentials = auth(req);
  if (credentials) {
    if (credentials.name === req.doc.emailAddress) {
      res.send(req.doc);
    }
  } else {
    const err = new Error("Need to log in first.");
    err.status = 400;
    return next(err);
  }
});

//Post route to create a new user.
router.post("/", function(req, res, next) {
  let user = new User(req.body);
  user.save(function(err, user) {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.status(201);
    res.location("/");
    res.end();
  });
});

module.exports = router;
