const mongoose = require("mongoose"); //MongoDB
const chai = require("chai"); //Testing for chai
const chaiHttp = require("chai-http"); //Necesarry to make server request.
const { User } = require("../models"); //UserSchema
const { Course } = require("../models"); //CourseSchema
const server = require("../index"); //Necesarry to make server request.
const expect = chai.expect; //Expect module for chai

//HTTP request purposes.
chai.use(chaiHttp);

//Get user route test that creates a new user, saves it, and then makes a request to the server in order to test the authentication.
//Adding the removal of user in case the test is run multiple times.
//Also tests whether or not a false positive would yield a 401 error as well.
describe("GET /users", () => {
  User.find({ fullName: "Tanuj Aswani" })
    .remove()
    .exec();
  it("returns authenticated user", done => {
    let user = new User({
      fullName: "Tanuj Aswani",
      emailAddress: "tanuj.aswani@gmail.com",
      password: "password"
    });
    user.save().then(function() {
      chai
        .request(server)
        .get("/api/users")
        .auth("tanuj.aswani@gmail.com", "password")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.emailAddress).to.equal(user.emailAddress);
          done();
        });
    });
  });
  it("returns 401 for invalid user", done => {
    chai
      .request(server)
      .get("/api/users")
      .auth("doesnotexist@hotmail.com", "password")
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(401);
        done();
      });
  });
});
