/* const express = require('express')
const router = express.Router()
const {
  obtenerMembresias,
  crearMembresia,
  actualizarMembresia,
  eliminarMembresia,
  asignarMembresia,
  obtenerAsignaciones,
  miMembresia
} = require('../controllers/membresias.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', obtenerMembresias)
router.post('/', verificarToken, soloAdmin, crearMembresia)
router.put('/:id', verificarToken, soloAdmin, actualizarMembresia)
router.delete('/:id', verificarToken, soloAdmin, eliminarMembresia)
router.post('/asignar', verificarToken, soloAdmin, asignarMembresia)
router.get('/asignaciones', verificarToken, soloAdmin, obtenerAsignaciones)
router.get('/mi-membresia', verificarToken, miMembresia)

module.exports = router */


const express = require('express')
const router = express.Router()
const {
  obtenerMembresias,
  crearMembresia,
  actualizarMembresia,
  eliminarMembresia,
  asignarMembresia,
  obtenerAsignaciones,
  miMembresia,
  miMembresiaDetalle,
  eliminarAsignacion
} = require('../controllers/membresias.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', obtenerMembresias)
router.post('/', verificarToken, soloAdmin, crearMembresia)
router.put('/:id', verificarToken, soloAdmin, actualizarMembresia)
router.delete('/:id', verificarToken, soloAdmin, eliminarMembresia)
router.post('/asignar', verificarToken, soloAdmin, asignarMembresia)
router.get('/asignaciones', verificarToken, soloAdmin, obtenerAsignaciones)
router.delete('/asignaciones/:id', verificarToken, soloAdmin, eliminarAsignacion)
router.get('/mi-membresia', verificarToken, miMembresia)
router.get('/mi-membresia-detalle', verificarToken, miMembresiaDetalle)

module.exports = router