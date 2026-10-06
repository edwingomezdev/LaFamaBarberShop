const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const listar = () => prisma.servicio.findMany({ where: { activo: true }, orderBy: [{ orden: 'asc' }, { id: 'asc' }] })

const obtener = async (id) => {
  const servicio = await prisma.servicio.findUnique({ where: { id: Number(id) } })
  if (!servicio) throw createError(404, 'Servicio no encontrado')
  return servicio
}

const crear = ({ nombre, descripcion, precio, duracion, imagen, orden }) =>
  prisma.servicio.create({ data: { nombre, descripcion, precio, duracion, imagen, orden } })

const actualizar = (id, { nombre, descripcion, precio, duracion, activo, imagen, orden }) =>
  prisma.servicio.update({ where: { id: Number(id) }, data: { nombre, descripcion, precio, duracion, activo, imagen, orden } })

const eliminar = (id) =>
  prisma.servicio.update({ where: { id: Number(id) }, data: { activo: false } })

const reordenar = (orden) =>
  prisma.$transaction(
    orden.map(({ id, orden: pos }) =>
      prisma.servicio.update({ where: { id: Number(id) }, data: { orden: pos } })
    )
  )

module.exports = { listar, obtener, crear, actualizar, eliminar, reordenar }
