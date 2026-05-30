const barberosService = require('../services/barberos.service')

const obtenerBarberos = async (req, res, next) => {
  try { res.json(await barberosService.listar()) } catch (err) { next(err) }
}

const obtenerBarbero = async (req, res, next) => {
  try { res.json(await barberosService.obtener(req.params.id)) } catch (err) { next(err) }
}

const crearBarbero = async (req, res, next) => {
  try { res.status(201).json(await barberosService.crear(req.body)) } catch (err) { next(err) }
}

const actualizarBarbero = async (req, res, next) => {
  try { res.json(await barberosService.actualizar(req.params.id, req.body)) } catch (err) { next(err) }
}

const eliminarBarbero = async (req, res, next) => {
  try {
    await barberosService.eliminar(req.params.id)
    res.json({ mensaje: 'Barbero eliminado correctamente' })
  } catch (err) { next(err) }
}

module.exports = { obtenerBarberos, obtenerBarbero, crearBarbero, actualizarBarbero, eliminarBarbero }
