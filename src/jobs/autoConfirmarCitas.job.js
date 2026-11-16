const prisma = require('../prisma')

const fechaHoyBogotaUtc = () => {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  // Las fechas de cita se guardan como medianoche UTC del día local.
  return new Date(`${hoy}T00:00:00.000Z`)
}

module.exports = async function autoConfirmarCitasPendientes() {
  const limite = new Date(Date.now() - 15 * 60 * 1000)
  const resultado = await prisma.cita.updateMany({
    where: {
      estado: 'PENDIENTE',
      createdAt: { lte: limite },
      fecha: { gte: fechaHoyBogotaUtc() },
    },
    data: {
      estado: 'CONFIRMADA',
      calendarSyncStatus: 'PENDIENTE',
      calendarSyncIntentos: 0,
      calendarSyncError: null,
    },
  })

  if (resultado.count > 0) {
    console.info(`✅ ${resultado.count} cita(s) confirmada(s) automáticamente después de 15 minutos.`)
  }

  return resultado.count
}
