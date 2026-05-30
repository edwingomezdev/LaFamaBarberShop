const path = require('path')
const fs = require('fs')
const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const listarCarrusel = () =>
  prisma.imagenCarrusel.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } })

const crearImagen = ({ nombre, descripcion, url, orden, file }) => {
  const imageUrl = file ? `/uploads/${file.filename}` : url
  if (!imageUrl) throw createError(400, 'Se requiere una imagen o URL')
  return prisma.imagenCarrusel.create({
    data: { nombre: nombre || 'Sin nombre', descripcion, url: imageUrl, orden: Number(orden) || 0 },
  })
}

const actualizarImagen = (id, { nombre, descripcion, orden, activo }) =>
  prisma.imagenCarrusel.update({ where: { id: Number(id) }, data: { nombre, descripcion, orden: Number(orden), activo } })

const eliminarImagen = async (id) => {
  const imagen = await prisma.imagenCarrusel.findUnique({ where: { id: Number(id) } })
  if (imagen?.url?.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', imagen.url)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  return prisma.imagenCarrusel.delete({ where: { id: Number(id) } })
}

const actualizarImagenServicio = (id, { url, file }) => {
  const imageUrl = file ? `/uploads/${file.filename}` : url
  return prisma.servicio.update({ where: { id: Number(id) }, data: { imagen: imageUrl } })
}

module.exports = { listarCarrusel, crearImagen, actualizarImagen, eliminarImagen, actualizarImagenServicio }
