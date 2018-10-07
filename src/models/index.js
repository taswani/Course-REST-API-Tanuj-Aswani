const mongoose = require("mongoose"); //MongoDB requirement
const { Schema } = mongoose; //To create schemas from mongoose
const bcrypt = require("bcrypt"); //To hash passwords.

//User Model for API
const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  },
  password: {
    type: String,
    required: true
  }
});

//Function to authenticate users by comparing email address to database and then using bcrypt to compare hashed password.
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({ emailAddress: email }).exec(function(error, user) {
    if (error) {
      return callback(error);
    } else if (!user) {
      const err = new Error("User not found.");
      err.status = 401;
      return callback(err);
    } else if (password === user.password) {
      return callback(null, user);
    }
    bcrypt.compare(password, user.password, function(error, result) {
      if (result === true) {
        return callback(null, user);
      } else {
        const err = new Error("Password is incorrect");
        return callback(err);
      }
    });
  });
};

// User.find({}).forEach(function(user) {
//   user.password = bcrypt.hash(user.password, 10, function(err, hash) {
//     if (err) {
//       return next(err);
//     }
//     return hash;
//   });
//   user.save(user);
// });

//Pre save hook to make sure that password is hashed before saving.
UserSchema.pre("save", function(next) {
  const user = this;
  if (user.isNew) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  }
});

//Course model for API
const CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: String
  },
  materialsNeeded: {
    type: String
  },
  steps: [
    {
      stepNumber: { type: Number },
      title: { type: String, required: true },
      description: { type: String, required: true }
    }
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

//Review model for API
const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  postedOn: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: String
});

//Validation method to make sure course creator isn't the same as reviewer.
ReviewSchema.method("validateReview", function(reviewer, creator, callback) {
  const reviewerID = reviewer._id.toString();
  const creatorID = creator._id.toString();
  console.log(reviewerID, creatorID);
  if (creatorID === reviewerID) {
    const err = new Error("You are not allowed to review your own course!");
    return callback(err);
  } else {
    callback();
  }
});

const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);
const Review = mongoose.model("Review", ReviewSchema);

module.exports.User = User;
module.exports.Course = Course;
module.exports.Review = Review;
