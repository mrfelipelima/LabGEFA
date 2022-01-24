module.exports = {
  index (req, res) {
    db.collection('userProfile')
      .orderBy('createdAt', 'desc')
      .get()
      .then(data => {
        const users = []
        data.forEach((doc) => {
          users.push({
            userId: doc.id,
            createdAt: doc.data().createdAt,
            participacao: {
              labgefaStatus: doc.data().participacao.labgefaStatus,
              orientador: doc.data().participacao.orientador,
              ativo: doc.data().participacao.ativo,
              atividades: doc.data().participacao.atividades,
              linhaDePesquisa: doc.data().participacao.linhaDePesquisa
            },
            academicInfo: {
              turnoDeEstudo: doc.data().academicInfo.turnoDeEstudo,
              course: doc.data().academicInfo.course,
              semestreAtual: doc.data().academicInfo.semestreAtual,
              localDeEstudo: doc.data().academicInfo.localDeEstudo
            },
            personalData: {
              name: doc.data().personalData.name,
              lastname: doc.data().personalData.lastname,
              gender: doc.data().personalData.gender,
              birthdate: doc.data().personalData.birthdate,
              nickname: doc.data().personalData.nickname
            },
            email: doc.data().email,
            username: doc.data().username
          })
        })
        return res.json(users)
      }).catch(err => (console.error(err)))
  }
}
