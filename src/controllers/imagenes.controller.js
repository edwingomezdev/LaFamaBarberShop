const prisma = require('../prisma')
const path = require('path')
const fs = require('fs')

// ── CARRUSEL ──

const obtenerCarrusel = async (req, res) => {
  try {
    const imagenes = await prisma.imagenCarrusel.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })
    res.json(imagenes)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const crearImagenCarrusel = async (req, res) => {
  try {
    const { nombre, descripcion, url, orden } = req.body
    let imageUrl = url

    // Si subió archivo
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    }

    if (!imageUrl) {
      return res.status(400).json({ error: 'Se requiere una imagen o URL' })
    }

    const imagen = await prisma.imagenCarrusel.create({
      data: {
        nombre: nombre || 'Sin nombre',
        descripcion,
        url: imageUrl,
        orden: Number(orden) || 0
      }
    })
    res.status(201).json(imagen)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const actualizarImagenCarrusel = async (req, res) => {
  try {
    const { nombre, descripcion, orden, activo } = req.body
    const imagen = await prisma.imagenCarrusel.update({
      where: { id: Number(req.params.id) },
      data: { nombre, descripcion, orden: Number(orden), activo }
    })
    res.json(imagen)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const eliminarImagenCarrusel = async (req, res) => {
  try {
    const imagen = await prisma.imagenCarrusel.findUnique({
      where: { id: Number(req.params.id) }
    })
    // Si es archivo local, eliminarlo
    if (imagen?.url?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', imagen.url)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    await prisma.imagenCarrusel.delete({ where: { id: Number(req.params.id) } })
    res.json({ mensaje: 'Imagen eliminada' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// ── SERVICIOS ──

const actualizarImagenServicio = async (req, res) => {
  try {
    const { url } = req.body
    let imageUrl = url

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    }

    const servicio = await prisma.servicio.update({
      where: { id: Number(req.params.id) },
      data: { imagen: imageUrl }
    })
    res.json(servicio)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

module.exports = {
  obtenerCarrusel,
  crearImagenCarrusel,
  actualizarImagenCarrusel,
  eliminarImagenCarrusel,
  actualizarImagenServicio
}