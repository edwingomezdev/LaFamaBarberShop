const prisma = require('../prisma')

// GET /api/servicios
const obtenerServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true }
    })
    res.json(servicios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/servicios/:id
const obtenerServicio = async (req, res) => {
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' })
    }
    res.json(servicio)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/servicios
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion, imagen } = req.body
    const servicio = await prisma.servicio.create({
      data: { nombre, descripcion, precio, duracion, imagen }
    })
    res.status(201).json(servicio)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
// PUT /api/servicios/:id
const actualizarServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion, activo, imagen } = req.body
    const servicio = await prisma.servicio.update({
      where: { id: Number(req.params.id) },
      data: { nombre, descripcion, precio, duracion, activo, imagen }
    })
    res.json(servicio)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE /api/servicios/:id
const eliminarServicio = async (req, res) => {
  try {
    await prisma.servicio.update({
      where: { id: Number(req.params.id) },
      data: { activo: false }
    })
    res.json({ mensaje: 'Servicio eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio
}