const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const CITA_INCLUDE = {
  barbero: true,
  usuario: { select: { id: true, nombre: true, email: true, telefono: true } },
  servicios: { include: { servicio: true } },
}

const agendar = async ({ barberoId, fecha, hora, servicioIds, nota, usuarioId }) => {
  const barbero = await prisma.barbero.findUnique({ where: { id: Number(barberoId) } })
  if (!barbero) throw createError(404, 'Barbero no encontrado')

  const ocupada = await prisma.cita.findFirst({
    where: {
      barberoId: Number(barberoId),
      fecha: new Date(fecha),
      hora,
      estado: { not: 'CANCELADA' },
    },
  })
  if (ocupada) throw createError(400, 'Ese horario ya está ocupado')

  return prisma.cita.create({
    data: {
      usuarioId,
      barberoId: Number(barberoId),
      fecha: new Date(fecha),
      hora,
      nota,
      servicios: {
        create: servicioIds.map(id => ({ servicio: { connect: { id: Number(id) } } })),
      },
    },
    include: CITA_INCLUDE,
  })
}

const listar = () =>
  prisma.cita.findMany({ include: CITA_INCLUDE, orderBy: { fecha: 'asc' } })

const listarPorUsuario = (usuarioId) =>
  prisma.cita.findMany({
    where: { usuarioId },
    include: { barbero: true, servicios: { include: { servicio: true } } },
    orderBy: { fecha: 'asc' },
  })

const obtener = async (id) => {
  const cita = await prisma.cita.findUnique({ where: { id: Number(id) }, include: CITA_INCLUDE })
  if (!cita) throw createError(404, 'Cita no encontrada')
  return cita
}

const cambiarEstado = (id, estado) =>
  prisma.cita.update({ where: { id: Number(id) }, data: { estado } })

const cancelar = async (id, usuarioId) => {
  const cita = await prisma.cita.findUnique({ where: { id: Number(id) } })
  if (!cita) throw createError(404, 'Cita no encontrada')
  if (cita.usuarioId !== usuarioId) throw createError(403, 'No puedes cancelar una cita que no es tuya')
  return prisma.cita.update({ where: { id: Number(id) }, data: { estado: 'CANCELADA' } })
}

const horasOcupadas = async ({ barberoId, fecha }) => {
  if (!barberoId || !fecha) throw createError(400, 'barberoId y fecha son requeridos')
  const citas = await prisma.cita.findMany({
    where: { barberoId: Number(barberoId), fecha: new Date(fecha), estado: { not: 'CANCELADA' } },
    select: { hora: true },
  })
  return citas.map(c => c.hora)
}

module.exports = { agendar, listar, listarPorUsuario, obtener, cambiarEstado, cancelar, horasOcupadas }
