const { db, admin } = require("../services/admin");
const BusBoy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { uuid } = require("uuidv4");

exports.IndexProfiles = (req, res) => {
  db.collection("userProfile")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      const users = [];
      data.forEach((doc) => {
        users.push({
          userId: doc.data().userId,
          createdAt: doc.data().createdAt,
          participacao: {
            labgefaStatus: doc.data().participacao.labgefaStatus,
            orientador: doc.data().participacao.orientador,
            ativo: doc.data().participacao.ativo,
            atividades: doc.data().participacao.atividades,
            linhaDePesquisa: doc.data().participacao.linhaDePesquisa,
          },
          academicInfo: {
            turnoDeEstudo: doc.data().academicInfo.turnoDeEstudo,
            course: doc.data().academicInfo.course,
            semestreAtual: doc.data().academicInfo.semestreAtual,
            localDeEstudo: doc.data().academicInfo.localDeEstudo,
          },
          personalData: {
            name: doc.data().personalData.name,
            lastname: doc.data().personalData.lastname,
            gender: doc.data().personalData.gender,
            birthdate: doc.data().personalData.birthdate,
            nickname: doc.data().personalData.nickname,
          },
          email: doc.data().email,
          username: doc.data().username,
        });
      });
      return res.json(users);
    })
    .catch((err) => console.error(err));
};

exports.UpdateProfile = (req, res) => {
  const {email, password} = req.body
  
  const newUser = {
    createdAt: new Date().toISOString(),
    email,
    password
  }

  db.doc(`/userProfile/${newUser.username}`)
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
