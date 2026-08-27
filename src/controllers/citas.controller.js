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

const agendaDeHoy = async (req, res, next) => {
  try {
    res.json(await citasService.listarPorFecha(req.query.fecha))
  } catch (err) { next(err) }
}

const walkIn = async (req, res, next) => {
  try {
    const cita = await citasService.agendarWalkIn(req.body)
    res.status(201).json(cita)
  } catch (err) { next(err) }
}

// Horarios REALES disponibles para agendar, calculados en el backend
// (fecha + barbero + duración de los servicios elegidos), respetando
// el horario del negocio, las citas ya ocupadas y la hora actual si
// la fecha es hoy. El frontend solo pinta esta lista, no la inventa.
const slotsDisponibles = async (req, res, next) => {
  try {
    const { barberoId, fecha, servicioIds } = req.query
    const idsServicios = (servicioIds || '')
      .split(',')
      .filter(Boolean)
      .map(Number)

    res.json(
      await citasService.obtenerSlotsDisponibles({
        barberoId: Number(barberoId),
        fecha,
        servicioIds: idsServicios,
      })
    )
  } catch (err) { next(err) }
}

module.exports = {
  agendarCita,
  obtenerCitas,
  misCitas,
  obtenerCita,
  cambiarEstado,
  cancelarCita,
  horasOcupadas,
  slotsDisponibles,
  agendaDeHoy,
  walkIn,
}