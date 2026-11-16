const prisma = require('../prisma')
const whatsappService = require('../whatsapp/services/whatsapp.service')
let warnedMissingMigration = false

const toUtc = (cita) => {
  const [year, month, day] = cita.fecha.toISOString().slice(0, 10).split('-').map(Number)
  const [hour, minute] = cita.hora.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour + 5, minute))
}

module.exports = async function enviarRecordatoriosCitas() {
  if (!process.env.WHATSAPP_REMINDER_TEMPLATE_NAME) return
  const ahora = new Date()
  const reintentarDesde = new Date(ahora.getTime() - 15 * 60 * 1000)
  let citas
  try {
    citas = await prisma.cita.findMany({
    where: {
      estado: 'CONFIRMADA', recordatorioEnviadoAt: null, recordatorioIntentos: { lt: 5 },
      usuario: { aceptaRecordatoriosWhatsapp: true, telefono: { not: null } },
      OR: [{ recordatorioIntentadoAt: null }, { recordatorioIntentadoAt: { lte: reintentarDesde } }],
    },
    include: { usuario: true, barbero: true, servicios: { include: { servicio: true } } },
    orderBy: [{ fecha: 'asc' }, { hora: 'asc' }], take: 30,
    })
  } catch (error) {
    if (['P1001', 'P1017', 'P2021', 'P2022'].includes(error.code)) {
      if (!warnedMissingMigration) {
        console.warn('Recordatorios WhatsApp en espera: inicia PostgreSQL y aplica las migraciones con `npx prisma migrate deploy`.')
        warnedMissingMigration = true
      }
      return
    }
    throw error
  }
  for (const cita of citas) {
    const inicio = toUtc(cita)
    const horasRestantes = (inicio.getTime() - ahora.getTime()) / 3600000
    if (horasRestantes <= 0 || horasRestantes > 24) continue
    await prisma.cita.update({ where: { id: cita.id }, data: { recordatorioIntentadoAt: ahora, recordatorioIntentos: { increment: 1 } } })
    try {
      const dateTime = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short' }).format(inicio)
      await whatsappService.sendReminderTemplate(cita.usuario.telefono.replace(/\D/g, ''), {
        citaId: cita.id, nombre: cita.usuario.nombre,
        servicio: cita.servicios.map((item) => item.servicio.nombre).join(', '),
        barbero: cita.barbero.nombre, fechaHora: dateTime,
      })
      await prisma.cita.update({ where: { id: cita.id }, data: { recordatorioEnviadoAt: new Date(), ultimoErrorRecordatorio: null } })
    } catch (error) {
      await prisma.cita.update({ where: { id: cita.id }, data: { ultimoErrorRecordatorio: String(error.response?.data?.error?.message || error.message).slice(0, 500) } })
      console.error(`No se pudo enviar recordatorio para cita ${cita.id}:`, error.response?.data?.error?.message || error.message)
    }
  }
}
