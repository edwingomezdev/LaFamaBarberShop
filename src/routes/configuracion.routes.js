const express = require('express')
const router = express.Router()
const configuracionService = require('../services/configuracion.service')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

// Pública: el frontend la usa para decidir si muestra los links/páginas
// de Productos y Membresías.
router.get('/', async (req, res, next) => {
  try {
    res.json(await configuracionService.obtener())
  } catch (err) { next(err) }
})

// Solo admin puede cambiar los interruptores.
router.put('/', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    res.json(await configuracionService.actualizar(req.body))
  } catch (err) { next(err) }
})

module.exports = router
