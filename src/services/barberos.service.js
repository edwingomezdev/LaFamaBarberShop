const bcrypt = require('bcryptjs')
const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const PIN_REGEX = /^\d{4}$/

const hashPin = async (pin) => {
  if (!PIN_REGEX.test(pin)) throw createError(400, 'El PIN debe ser exactamente 4 dígitos numéricos')
  return bcrypt.hash(pin, 10)
}

const listar = () =>
  prisma.barbero.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, especialidad: true, descripcion: true, foto: true, activo: true, orden: true, createdAt: true },
    orderBy: [{ orden: 'asc' }, { id: 'asc' }],
  })

const obtener = async (id) => {
  const barbero = await prisma.barbero.findUnique({ where: { id: Number(id) } })
  if (!barbero) throw createError(404, 'Barbero no encontrado')
  return barbero
}

const crear = async ({ nombre, especialidad, descripcion, foto, pin, orden }) => {
  if (!nombre || !especialidad) throw createError(400, 'Nombre y especialidad son obligatorios')
  const data = { nombre, especialidad, descripcion, foto, orden }
  if (pin) data.pin = await hashPin(pin)
  return prisma.barbero.create({ data })
}

const actualizar = async (id, { nombre, especialidad, descripcion, foto, activo, pin, orden }) => {
  const data = { nombre, especialidad, descripcion, foto, activo, orden }
  if (pin) data.pin = await hashPin(pin)
  return prisma.barbero.update({ where: { id: Number(id) }, data })
}

const eliminar = (id) =>
  prisma.barbero.update({ where: { id: Number(id) }, data: { activo: false } })

const reordenar = (orden) =>
  prisma.$transaction(
    orden.map(({ id, orden: pos }) =>
      prisma.barbero.update({ where: { id: Number(id) }, data: { orden: pos } })
    )
  )

// ── Días de descanso ──
const listarDiasDescanso = (barberoId) =>
  prisma.diaDescanso.findMany({
    where: { barberoId: Number(barberoId) },
    orderBy: { fecha: 'asc' },
  })

const crearDiaDescanso = async (barberoId, { fecha, motivo }) => {
  if (!fecha) throw createError(400, 'La fecha es requerida')
  const [year, month, day] = fecha.split('-').map(Number)
  const fechaUTC = new Date(Date.UTC(year, month - 1, day))
  try {
    return await prisma.diaDescanso.create({
      data: { barberoId: Number(barberoId), fecha: fechaUTC, motivo },
    })
  } catch (e) {
    if (e.code === 'P2002') throw createError(400, 'Ese barbero ya tiene ese día marcado como descanso')
    throw e
  }
}

const eliminarDiaDescanso = (id) =>
  prisma.diaDescanso.delete({ where: { id: Number(id) } })

module.exports = { listar, obtener, crear, actualizar, eliminar, reordenar, listarDiasDescanso, crearDiaDescanso, eliminarDiaDescanso }
