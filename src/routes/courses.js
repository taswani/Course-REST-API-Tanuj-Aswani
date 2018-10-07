const express = require("express"); //Express
const router = express.Router(); //Router
const { Course } = require("../models"); //CourseSchema
const { Review } = require("../models"); //ReviewSchema
const mid = require("../middleware"); //Require the middleware

//Get route to find the courses available.
router.get("/", function(req, res, next) {
  Course.find({})
    .select("title")
    .exec(function(err, courses) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      res.status(200);
      res.send(courses);
    });
});

//Get route to find specific course by ID.
router.get("/:id", function(req, res, next) {
  Course.findById(req.params.id)
    .populate("reviews")
    .populate("user", "_id fullName")
    .exec(function(err, course) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      res.status(200);
      res.send(course);
    });
});

//Post route that requires authentication in order to create a new course in the catalog.
router.post("/", mid.authenticateUser, function(req, res, next) {
  let course = new Course(req.body);
  course.save(function(err, course) {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.location("/");
    res.status(201);
    res.end();
  });
});

//Put route that allows the authenticated user to update the course details in the database.
router.put("/:id", mid.authenticateUser, function(req, res, next) {
  Course.findByIdAndUpdate(req.params.id, req.body, function(err, course) {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.status(204);
    res.end();
  });
});

//Post route that lets the authenticated user post a review only if he did not create the course.
//Finds course by id, and then proceeds to create a new review for that specific course (hence the use of /:id for the course.)
router.post("/:id/reviews", mid.authenticateUser, function(req, res, next) {
  Course.findById(req.params.id)
    .populate("reviews")
    .populate("user")
    .exec(function(err, course) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      req.body.user = req.doc;
      let review = new Review(req.body);
      review.validateReview(req.body.user, course.user, function(err) {
        if (err) {
          err.status = 400;
          return next(err);
        }
        review.save(function(err, review) {
          if (err) return next(err);
          res.status(201);
          course.reviews.push(review);
          course.save();
          res.location("/" + req.params.id);
          res.end();
        });
      });
    });
});

module.exports = router;
