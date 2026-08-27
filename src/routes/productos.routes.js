const express = require('express')
const router = express.Router()
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productos.controller')
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware')

router.get('/', obtenerProductos)
router.post('/', verificarToken, permitirRoles('ADMIN', 'PRODUCTOS'), crearProducto)
router.put('/:id', verificarToken, permitirRoles('ADMIN', 'PRODUCTOS'), actualizarProducto)
router.delete('/:id', verificarToken, permitirRoles('ADMIN', 'PRODUCTOS'), eliminarProducto)

module.exports = router