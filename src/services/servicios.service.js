const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const listar = () => prisma.servicio.findMany({ where: { activo: true } })

const obtener = async (id) => {
  const servicio = await prisma.servicio.findUnique({ where: { id: Number(id) } })
  if (!servicio) throw createError(404, 'Servicio no encontrado')
  return servicio
}

const crear = ({ nombre, descripcion, precio, duracion, imagen }) =>
  prisma.servicio.create({ data: { nombre, descripcion, precio, duracion, imagen } })

const actualizar = (id, { nombre, descripcion, precio, duracion, activo, imagen }) =>
  prisma.servicio.update({ where: { id: Number(id) }, data: { nombre, descripcion, precio, duracion, activo, imagen } })

const eliminar = (id) =>
  prisma.servicio.update({ where: { id: Number(id) }, data: { activo: false } })

module.exports = { listar, obtener, crear, actualizar, eliminar }
