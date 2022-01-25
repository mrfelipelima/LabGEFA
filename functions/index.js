require("dotenv").config({
  path: "../.env",
});
const functions = require("firebase-functions");
const app = require("express")();

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
app.post("/signup", SignupController);
app.post("/login", LoginController);

// SCREAMS ROUTES

app.get("/getscreams", ScreamsIndex);
app.post("/createscream", FBAuth, ScreamsCreate);

// USERS & PROFILE ROUTES

app.get("/getusers", IndexProfiles);
app.post("/createuser", UpdateProfile);

exports.api = functions.region("southamerica-east1").https.onRequest(app);
