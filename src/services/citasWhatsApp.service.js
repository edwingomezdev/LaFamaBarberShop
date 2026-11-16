const prisma = require('../prisma')
const citasService = require('./citas.service')
const conversationManager = require('../automation/conversation/conversation.manager')

const normalizar = (telefono) => String(telefono || '').replace(/\D/g, '')
const citaPorCliente = async (telefono, citaId) => {
  const cita = await prisma.cita.findUnique({ where: { id: Number(citaId) }, include: { usuario: true, servicios: { include: { servicio: true } } } })
  if (!cita || normalizar(cita.usuario.telefono) !== normalizar(telefono)) return null
  return cita
}

const procesarBoton = async (telefono, payload) => {
  const match = /^CITA_(\d+)_(ASISTIRE|REPROGRAMAR|CANCELAR)$/.exec(String(payload || ''))
  if (!match) return null
  const [, id, accion] = match
  const cita = await citaPorCliente(telefono, id)
  if (!cita) return 'No encontré una cita asociada a este número. Escríbenos para ayudarte.'
  if (!['PENDIENTE', 'CONFIRMADA'].includes(cita.estado)) return `Esta cita ya aparece como ${cita.estado.toLowerCase()}; no puedo cambiarla desde aquí.`
  if (accion === 'ASISTIRE') {
    await prisma.cita.update({ where: { id: cita.id }, data: { respuestaAsistencia: 'ASISTIRE' } })
    return '¡Listo! Registramos que asistirás. Te esperamos en La Fama Barber. 💈'
  }
  if (accion === 'CANCELAR') {
    await prisma.cita.update({ where: { id: cita.id }, data: { estado: 'CANCELADA', calendarSyncStatus: 'PENDIENTE', calendarSyncIntentos: 0, calendarSyncError: null } })
    return 'Tu cita quedó cancelada. Si quieres, puedes escribir *reservar* para buscar otro horario.'
  }
  await conversationManager.update(telefono, { step: 'RESCHEDULE_SELECT_DATE', rescheduleAppointmentId: cita.id })
  return 'Claro. ¿Para qué fecha quieres cambiarla? Puedes escribir *mañana*, *pasado mañana* o una fecha como *20/11/2026*.'
}

const continuarReprogramacion = async (telefono, context, message) => {
  if (!context?.step?.startsWith('RESCHEDULE_')) return null
  const dateParser = require('../automation/parsers/dateParser')
  const timeParser = require('../automation/parsers/timeParser')
  const cita = await citaPorCliente(telefono, context.rescheduleAppointmentId)
  if (!cita) { await conversationManager.clear(telefono); return 'No encontré esa cita. Escribe *reservar* para iniciar una nueva.' }
  if (context.step === 'RESCHEDULE_SELECT_DATE') {
    const fecha = dateParser.parse(message)
    if (!fecha || fecha < dateParser.todayBogota()) return 'No reconocí esa fecha o ya pasó. Dime otra fecha futura, por ejemplo *mañana* o *20/11/2026*.'
    const slots = await citasService.obtenerSlotsDisponibles({ barberoId: cita.barberoId, fecha, servicioIds: cita.servicios.map((item) => item.servicio.id), excludeAppointmentId: cita.id })
    if (!slots.length) return 'Ese día no tiene horarios libres con el mismo barbero. Dime otra fecha.'
    await conversationManager.update(telefono, { step: 'RESCHEDULE_SELECT_TIME', rescheduleDate: fecha, availableSlots: slots })
    return `Horarios libres el ${fecha}:\n${slots.map((slot, index) => `${index + 1}. ${slot}`).join('\n')}\n\nResponde con el número o la hora.`
  }
  if (context.step === 'RESCHEDULE_SELECT_TIME') {
    const raw = String(message || '').trim()
    const hora = /^\d+$/.test(raw) ? context.availableSlots?.[Number(raw) - 1] : timeParser.parse(raw)
    if (!hora || !context.availableSlots?.includes(hora)) return `Elige uno de estos horarios: ${context.availableSlots.join(', ')}`
    try {
      await citasService.reprogramar({ id: cita.id, fecha: context.rescheduleDate, hora, usuarioId: cita.usuarioId })
      await conversationManager.clear(telefono)
      return `✅ Tu cita quedó reprogramada para el ${context.rescheduleDate} a las ${hora}. Te esperamos.`
    } catch (error) {
      if (error.statusCode === 409 || error.status === 409) return 'Ese horario se acaba de ocupar. Dime otra hora o escribe *cancelar* para salir.'
      throw error
    }
  }
  return null
}

module.exports = { procesarBoton, continuarReprogramacion }
