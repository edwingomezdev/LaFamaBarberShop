const serviciosService = require('../services/servicios.service')

const obtenerServicios = async (req, res, next) => {
  try { res.json(await serviciosService.listar()) } catch (err) { next(err) }
}

const obtenerServicio = async (req, res, next) => {
  try { res.json(await serviciosService.obtener(req.params.id)) } catch (err) { next(err) }
}

const crearServicio = async (req, res, next) => {
  try { res.status(201).json(await serviciosService.crear(req.body)) } catch (err) { next(err) }
}

const actualizarServicio = async (req, res, next) => {
  try { res.json(await serviciosService.actualizar(req.params.id, req.body)) } catch (err) { next(err) }
}

const eliminarServicio = async (req, res, next) => {
  try {
    await serviciosService.eliminar(req.params.id)
    res.json({ mensaje: 'Servicio eliminado correctamente' })
  } catch (err) { next(err) }
}

module.exports = { obtenerServicios, obtenerServicio, crearServicio, actualizarServicio, eliminarServicio }
