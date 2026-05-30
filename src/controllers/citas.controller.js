const citasService = require('../services/citas.service')

const agendarCita = async (req, res, next) => {
  try {
    const cita = await citasService.agendar({ ...req.body, usuarioId: req.usuario.id })
    res.status(201).json(cita)
  } catch (err) { next(err) }
}

const obtenerCitas = async (req, res, next) => {
  try {
    res.json(await citasService.listar())
  } catch (err) { next(err) }
}

const misCitas = async (req, res, next) => {
  try {
    res.json(await citasService.listarPorUsuario(req.usuario.id))
  } catch (err) { next(err) }
}

const obtenerCita = async (req, res, next) => {
  try {
    res.json(await citasService.obtener(req.params.id))
  } catch (err) { next(err) }
}

const cambiarEstado = async (req, res, next) => {
  try {
    res.json(await citasService.cambiarEstado(req.params.id, req.body.estado))
  } catch (err) { next(err) }
}

const cancelarCita = async (req, res, next) => {
  try {
    await citasService.cancelar(req.params.id, req.usuario.id)
    res.json({ mensaje: 'Cita cancelada correctamente' })
  } catch (err) { next(err) }
}

const horasOcupadas = async (req, res, next) => {
  try {
    res.json(await citasService.horasOcupadas(req.query))
  } catch (err) { next(err) }
}

module.exports = { agendarCita, obtenerCitas, misCitas, obtenerCita, cambiarEstado, cancelarCita, horasOcupadas }
