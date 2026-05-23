const express = require('express')
const router = express.Router()
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productos.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', obtenerProductos)
router.post('/', verificarToken, soloAdmin, crearProducto)
router.put('/:id', verificarToken, soloAdmin, actualizarProducto)
router.delete('/:id', verificarToken, soloAdmin, eliminarProducto)

module.exports = router