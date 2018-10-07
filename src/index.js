"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const jsonParser = require("body-parser").json;
const mongoose = require("mongoose");
const app = express();
const users = require("./routes/users");
const courses = require("./routes/courses");

//Mongoose connections
mongoose.connect("mongodb://localhost:27017/course-api");
const db = mongoose.connection;

//DB shows error if there is a connection error.
db.on("error", function(err) {
  console.error("connection error:", err);
});

//DB shows successful connection upon opening.
db.once("open", function() {
  console.log("Database connection successful.");
});

// set our port
app.set("port", process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan("dev"));
app.use(jsonParser());

// add additional routes here
app.use("/api/users", users);
app.use("/api/courses", courses);

// send a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Course Review API"
  });
});

// uncomment this route in order to test the global error handler
// app.get('/error', function (req, res) {
//   throw new Error('Test error');
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

module.exports = app;
