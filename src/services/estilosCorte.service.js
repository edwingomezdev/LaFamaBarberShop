const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const listar = () =>
  prisma.estiloCorte.findMany({
    where: { activo: true },
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
  })

const obtener = async (id) => {
  const estilo = await prisma.estiloCorte.findUnique({ where: { id: Number(id) } })
  if (!estilo || !estilo.activo) throw createError(404, 'Estilo de corte no encontrado')
  return estilo
}

const crear = ({ nombre, descripcion, imagen, categoria }) => {
  if (!nombre) throw createError(400, 'El nombre es obligatorio')
  return prisma.estiloCorte.create({ data: { nombre, descripcion, imagen, categoria } })
}

const actualizar = (id, { nombre, descripcion, imagen, categoria, activo }) =>
  prisma.estiloCorte.update({
    where: { id: Number(id) },
    data: { nombre, descripcion, imagen, categoria, activo },
  })

const eliminar = (id) =>
  prisma.estiloCorte.update({ where: { id: Number(id) }, data: { activo: false } })

module.exports = { listar, obtener, crear, actualizar, eliminar }
