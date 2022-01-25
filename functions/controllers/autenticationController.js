const { db } = require("../services/admin");
const autentication = require("firebase/auth");
const firebase = require("firebase/app");
const { getAuth } = require("firebase/auth");
const {
  ValidateSignupData,
  ValidateLoginData,
} = require("../services/validators");

const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  databaseURL: process.env.DATABASEURL,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
};

firebase.initializeApp(firebaseConfig);

const auth = getAuth();

exports.SignupController = (req, res) => {
  let tokenId, userId;
  const newregistration = {
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    username: req.body.username,
  };

  const { valid, errors } = ValidateSignupData(newregistration);
  if (!valid) return res.status(400).json(errors);

  db.doc(`/userProfile/${newregistration.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({
          username: "this username already taken, please, try another.",
        });
      } else {
        return autentication.createUserWithEmailAndPassword(
          auth,
          newregistration.email,
          newregistration.password
        );
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((token) => {
      tokenId = token;
      const userCredentials = {
        username: newregistration.username,
        email: newregistration.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db
        .doc(`/userProfile/${newregistration.username}`)
        .set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ tokenId });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

exports.LoginController = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = ValidateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  autentication
    .signInWithEmailAndPassword(auth, user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, prlease try again" });
      } else return res.status(500).json({ error: err.code });
    });
};
