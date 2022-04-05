const express = require("express");
const routes = express.Router();

const {
  signup,
  login,
  UpdateProfile,
  UploadProfileImage,
} = require("./handlers/users");

const {
  ScreamsCreate,
  ScreamsRead,
} = require("./handlers/screams");

const FBAuth = require("./utils/FBAuth");

// AUTENTICATION ROUTES
routes.post("/signup", signup);
routes.post("/login", login);

// SCREAMS ROUTES

routes.get("/getscreams", ScreamsRead);
routes.post("/createscream", FBAuth, ScreamsCreate);

// USERS & PROFILE ROUTES

routes.post("/profile/update", UpdateProfile);
routes.post("/profile/image", FBAuth, UploadProfileImage);

module.exports = routes;
