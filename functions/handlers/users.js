const { db, admin } = require("../utils/admin");
const autentication = require("firebase/auth");
const { auth } = require("../utils/config")


const BusBoy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { uuid } = require("uuidv4");

const {
  ValidateSignupData,
  ValidateLoginData,
} = require("../utils/validators");



// USER SIGN UP
exports.signup = (req, res) => {
  let tokenId, userId;
  const newRegistration = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username,
  };

  const { valid, errors } = ValidateSignupData(newRegistration);
  if (!valid) return res.status(400).json(errors);

  db.doc(`/users/${newRegistration.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({
          username: "this username already taken, please, try another.",
        });
      } else {
        return autentication.createUserWithEmailAndPassword(
          auth,
          newRegistration.email,
          newRegistration.password
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
        username: newRegistration.username,
        email: newRegistration.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db
        .doc(`/users/${newRegistration.username}`)
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

// USER SIGN IN
exports.login = (req, res) => {
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


// USER UPDATE PROFILE
exports.UpdateProfile = (req, res) => {
  const {email, password} = req.body

  const newUser = {
    createdAt: new Date().toISOString(),
    email,
    password
  }

  db.doc(`/users/${newUser.username}`)
    .update(newUser)
    .then((doc) => {
      res.status(201).json({
        message: `usuário ${newUser.username} atualizado com sucesso`,
      });
      console.log(doc);
    })
    .catch((err) => {
      res.status(500).json({ error: "alguma coisa deu ruim" });
      console.error(err);
    });
};


// USER UPDATE PROFILE PICTURE
exports.UploadProfileImage = (req, res) => {
  const busboy = BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info
    console.log(filename);
    console.log(encoding);
    console.log(mimeType);
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${uuid()}.${imageExtension}`;
    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filePath, mimeType };
    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimeType,
          },
        },
      })
      .then(() => {
        const imageURL = `https://firebasestorage.googleapis.com/v0/b/${process.env.STORAGEBUCKET}/o/${imageFileName}?alt=media`;
        return db.doc(`/userProfile/${req.user.handle}`).update({ imageURL });
      })
      .then(() => {
        return res.json({ message: "image upload succesfuly" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};
