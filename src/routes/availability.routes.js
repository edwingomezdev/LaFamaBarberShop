const express = require('express')

const router = express.Router()

const {
  obtenerDisponibilidad,
} = require('../controllers/availability.controller')

router.get('/', obtenerDisponibilidad)

module.exports = router