const membresiasService = require('../services/membresias.service')

const obtenerMembresias = async (req, res, next) => {
  try { res.json(await membresiasService.listar()) } catch (err) { next(err) }
}

const crearMembresia = async (req, res, next) => {
  try { res.status(201).json(await membresiasService.crear(req.body)) } catch (err) { next(err) }
}

const actualizarMembresia = async (req, res, next) => {
  try { res.json(await membresiasService.actualizar(req.params.id, req.body)) } catch (err) { next(err) }
}

const eliminarMembresia = async (req, res, next) => {
  try {
    await membresiasService.eliminar(req.params.id)
    res.json({ mensaje: 'Membresía eliminada' })
  } catch (err) { next(err) }
}

const asignarMembresia = async (req, res, next) => {
  try { res.status(201).json(await membresiasService.asignar(req.body)) } catch (err) { next(err) }
}

const obtenerAsignaciones = async (req, res, next) => {
  try { res.json(await membresiasService.listarAsignaciones()) } catch (err) { next(err) }
}

const miMembresia = async (req, res, next) => {
  try { res.json(await membresiasService.miMembresia(req.usuario.id)) } catch (err) { next(err) }
}

const miMembresiaDetalle = async (req, res, next) => {
  try { res.json(await membresiasService.miMembresiaDetalle(req.usuario.id)) } catch (err) { next(err) }
}

const eliminarAsignacion = async (req, res, next) => {
  try {
    await membresiasService.eliminarAsignacion(req.params.id)
    res.json({ mensaje: 'Membresía eliminada del usuario' })
  } catch (err) { next(err) }
}

// Exportada para uso en jobs
const verificarMembresiasVencidas = () => membresiasService.verificarVencidas()

module.exports = {
  obtenerMembresias, crearMembresia, actualizarMembresia, eliminarMembresia,
  asignarMembresia, obtenerAsignaciones, miMembresia, miMembresiaDetalle,
  eliminarAsignacion, verificarMembresiasVencidas,
}
