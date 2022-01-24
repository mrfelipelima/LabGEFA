const express = require('express')

const usersController = require('./controllers/usersController')

const routes = express.Router()

routes.get('/users', usersController.index)

module.exports = routes
