require("dotenv").config({
  path: "../.env",
});
const functions = require("firebase-functions");
const app = require("express")();
const routes = require("./routes");

app.use(routes);

exports.api = functions.region("southamerica-east1").https.onRequest(app);
