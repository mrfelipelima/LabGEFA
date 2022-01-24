require('dotenv').config({
  path: '../.env'
})
const functions = require('firebase-functions')
const firebase = require('firebase/app')
const autentication = require('firebase/auth')
const admin = require('firebase-admin')
const { getAuth } = require('firebase/auth')
const app = require('express')()

const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  databaseURL: process.env.DATABASEURL,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID
}

firebase.initializeApp(firebaseConfig)

admin.initializeApp()
const auth = getAuth()
const db = admin.firestore()

// GET USER FROM DATABASE ROUTE

app.get('/getusers', (req, res) => {
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
})

// CREATE USER IN DATABASE ROUTE

app.post('/createuser', (req, res) => {
  const newUser = {
    createdAt: new Date().toISOString(),
    participacao: {
      labgefaStatus: req.body.participacao.labgefaStatus,
      orientador: req.body.participacao.orientador,
      ativo: req.body.participacao.ativo,
      atividades: req.body.participacao.atividades,
      linhaDePesquisa: req.body.participacao.linhaDePesquisa
    },
    academicInfo: {
      turnoDeEstudo: req.body.academicInfo.turnoDeEstudo,
      course: req.body.academicInfo.course,
      semestreAtual: req.body.academicInfo.semestreAtual,
      localDeEstudo: req.body.academicInfo.localDeEstudo
    },
    personalData: {
      name: req.body.personalData.name,
      lastname: req.body.personalData.lastname,
      gender: req.body.personalData.gender,
      birthdate: req.body.personalData.birthdate,
      nickname: req.body.personalData.nickname
    },
    email: req.body.email,
    username: req.body.username
  }

  db.doc(`/userProfile/${newUser.username}`)
    .update(newUser)
    .then(doc => {
      res.status(201).json({ message: `usuário ${newUser.username} atualizado com sucesso` })
      console.log(doc)
    })
    .catch(err => {
      res.status(500).json({ error: 'alguma coisa deu ruim' })
      console.error(err)
    })
})

const isEmpty = (string) => {
  if (string.trim() === '') return true
  else return false
}

const isEmail = (email) => {
  // eslint-disable-next-line no-useless-escape
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (email.match(emailRegEx)) return true
  else return false
}

// Signup Route

app.post('/signup', (req, res) => {
  let tokenId, userId
  const newregistration = {
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    username: req.body.username
  }

  const errors = {}

  if (isEmpty(newregistration.email)) {
    errors.email = 'Must not be empty'
  } else if (!isEmail(newregistration.email)) {
    errors.email = 'Must be a valid e-mail address'
  }

  if (isEmpty(newregistration.password)) errors.password = 'Password must not be empty'
  if (newregistration.password !== newregistration.confirmpassword) errors.confirmPassword = 'Passwords must match'
  if (isEmpty(newregistration.username)) errors.username = 'Username must not be empty'

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  db.doc(`/userProfile/${newregistration.username}`).get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ username: 'this username already taken, please, try another.' })
      } else {
        return autentication.createUserWithEmailAndPassword(auth, newregistration.email, newregistration.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(token => {
      tokenId = token
      const userCredentials = {
        username: newregistration.username,
        email: newregistration.email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/userProfile/${newregistration.username}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({ tokenId })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email already in use' })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
})

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  const errors = {}

  if (isEmpty(user.email)) errors.email = 'Must not be empty'
  if (isEmpty(user.password)) errors.password = 'Must not be empty'

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  autentication.signInWithEmailAndPassword(auth, user.email, user.password)
    .then(data => {
      return data.user.getIdToken()
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({ general: 'Wrong credentials, prlease try again' })
      } else return res.status(500).json({ error: err.code })
    })
})

exports.api = functions.region('southamerica-east1').https.onRequest(app)
