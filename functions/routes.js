const express = require("express");
const routes = express.Router();

const {
  SignupController,
  LoginController,
} = require("./controllers/autenticationController");

const {
  ScreamsIndex,
  ScreamsCreate,
} = require("./controllers/screamsController");

const {
  IndexProfiles,
  UpdateProfile,
} = require("./controllers/profileController");

const FBAuth = require("./services/FBAuth");

// AUTENTICATION ROUTES
routes.post("/signup", SignupController);
routes.post("/login", LoginController);

// SCREAMS ROUTES

routes.get("/getscreams", ScreamsIndex);
routes.post("/createscream", FBAuth, ScreamsCreate);

// USERS & PROFILE ROUTES

routes.get("/getusers", IndexProfiles);
routes.post("/createuser", UpdateProfile);

module.exports = routes;
