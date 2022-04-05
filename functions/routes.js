const express = require("express");
const routes = express.Router();

const {
  SignupController,
  LoginController,
} = require("./utils/autentication");

const {
  ScreamsIndex,
  ScreamsCreate,
} = require("./handlers/screams");

const {
  IndexProfiles,
  UpdateProfile,
  UploadProfileImage,
} = require("./handlers/users");

const FBAuth = require("./utils/FBAuth");

// AUTENTICATION ROUTES
routes.post("/signup", SignupController);
routes.post("/login", LoginController);

// SCREAMS ROUTES

routes.get("/getscreams", ScreamsIndex);
routes.post("/createscream", FBAuth, ScreamsCreate);

// USERS & PROFILE ROUTES

routes.get("/getusers", IndexProfiles);
routes.post("/createuser", UpdateProfile);
routes.post("/profile/image", FBAuth, UploadProfileImage);

module.exports = routes;
