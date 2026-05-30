const productosService = require('../services/productos.service')

const obtenerProductos = async (req, res, next) => {
  try { res.json(await productosService.listar()) } catch (err) { next(err) }
}

const crearProducto = async (req, res, next) => {
  try { res.status(201).json(await productosService.crear(req.body)) } catch (err) { next(err) }
}

const actualizarProducto = async (req, res, next) => {
  try { res.json(await productosService.actualizar(req.params.id, req.body)) } catch (err) { next(err) }
}

const eliminarProducto = async (req, res, next) => {
  try {
    await productosService.eliminar(req.params.id)
    res.json({ mensaje: 'Producto eliminado' })
  } catch (err) { next(err) }
}

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto }
