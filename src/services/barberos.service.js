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
    select: { id: true, nombre: true, especialidad: true, descripcion: true, foto: true, activo: true, createdAt: true },
  })

const obtener = async (id) => {
  const barbero = await prisma.barbero.findUnique({ where: { id: Number(id) } })
  if (!barbero) throw createError(404, 'Barbero no encontrado')
  return barbero
}

const crear = async ({ nombre, especialidad, descripcion, foto, pin }) => {
  if (!nombre || !especialidad) throw createError(400, 'Nombre y especialidad son obligatorios')
  const data = { nombre, especialidad, descripcion, foto }
  if (pin) data.pin = await hashPin(pin)
  return prisma.barbero.create({ data })
}

const actualizar = async (id, { nombre, especialidad, descripcion, foto, activo, pin }) => {
  const data = { nombre, especialidad, descripcion, foto, activo }
  if (pin) data.pin = await hashPin(pin)
  return prisma.barbero.update({ where: { id: Number(id) }, data })
}

const eliminar = (id) =>
  prisma.barbero.update({ where: { id: Number(id) }, data: { activo: false } })

module.exports = { listar, obtener, crear, actualizar, eliminar }
