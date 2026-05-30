const express = require('express')
const router = express.Router()
const {
  obtenerEstilos,
  obtenerEstilo,
  crearEstilo,
  actualizarEstilo,
  eliminarEstilo,
} = require('../controllers/estilosCorte.controller')
const { verificarToken, verificarTokenFlexible, soloAdmin, soloAdminOBarbero } = require('../middlewares/auth.middleware')

router.get('/', verificarTokenFlexible, soloAdminOBarbero, obtenerEstilos)
router.get('/:id', verificarTokenFlexible, soloAdminOBarbero, obtenerEstilo)
router.post('/', verificarToken, soloAdmin, crearEstilo)
router.put('/:id', verificarToken, soloAdmin, actualizarEstilo)
router.delete('/:id', verificarToken, soloAdmin, eliminarEstilo)

module.exports = router
