const ventasService = require('../services/ventas.service')

const pendientesDeCobro = async (req, res, next) => {
  try {
    res.json(await ventasService.listarPendientesDeCobro())
  } catch (err) { next(err) }
}

const cobrar = async (req, res, next) => {
  try {
    const venta = await ventasService.cobrarVenta(Number(req.params.id), {
      metodoPago: req.body.metodoPago,
      extras: req.body.extras,
      cobradoPorId: req.usuario.id,
    })
    res.json(venta)
  } catch (err) { next(err) }
}

const venderProductos = async (req, res, next) => {
  try {
    const venta = await ventasService.venderProductos({
      productos: req.body.productos,
      metodoPago: req.body.metodoPago,
      cobradoPorId: req.usuario.id,
    })
    res.status(201).json(venta)
  } catch (err) { next(err) }
}

const cajaDelDia = async (req, res, next) => {
  try {
    res.json(await ventasService.cajaDelDia())
  } catch (err) { next(err) }
}

module.exports = { pendientesDeCobro, cobrar, venderProductos, cajaDelDia }
