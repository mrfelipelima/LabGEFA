const { db } = require("../services/admin");

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
  const newUser = {
    createdAt: new Date().toISOString(),
    participacao: {
      labgefaStatus: req.body.participacao.labgefaStatus,
      orientador: req.body.participacao.orientador,
      ativo: req.body.participacao.ativo,
      atividades: req.body.participacao.atividades,
      linhaDePesquisa: req.body.participacao.linhaDePesquisa,
    },
    academicInfo: {
      turnoDeEstudo: req.body.academicInfo.turnoDeEstudo,
      course: req.body.academicInfo.course,
      semestreAtual: req.body.academicInfo.semestreAtual,
      localDeEstudo: req.body.academicInfo.localDeEstudo,
    },
    personalData: {
      name: req.body.personalData.name,
      lastname: req.body.personalData.lastname,
      gender: req.body.personalData.gender,
      birthdate: req.body.personalData.birthdate,
      nickname: req.body.personalData.nickname,
    },
    email: req.body.email,
    username: req.body.username,
  };

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
