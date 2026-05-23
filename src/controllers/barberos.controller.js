const prisma = require('../prisma')
const bcrypt = require('bcrypt')

// GET /api/barberos
const obtenerBarberos = async (req, res) => {
  try {
    const barberos = await prisma.barbero.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        especialidad: true,
        foto: true,
        activo: true,
        createdAt: true,
        pin: true
      }
    })
    res.json(barberos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/barberos/:id
const obtenerBarbero = async (req, res) => {
  try {
    const barbero = await prisma.barbero.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!barbero) {
      return res.status(404).json({ error: 'Barbero no encontrado' })
    }
    res.json(barbero)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/barberos
/* const crearBarbero = async (req, res) => {
  try {
    const { nombre, especialidad, foto, pin } = req.body
    if (!nombre || !especialidad) {
      return res.status(400).json({ error: 'Nombre y especialidad son obligatorios' })
    }
    const data = { nombre, especialidad, foto }
    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'El PIN debe ser exactamente 4 dígitos numéricos' })
      }
      data.pin = await bcrypt.hash(pin, 10)
    }
    const barbero = await prisma.barbero.create({ data })
    res.status(201).json(barbero)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/barberos/:id
const actualizarBarbero = async (req, res) => {
  try {
    const { nombre, especialidad, foto, activo, pin } = req.body
    const data = { nombre, especialidad, foto, activo }
    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'El PIN debe ser exactamente 4 dígitos numéricos' })
      }
      data.pin = await bcrypt.hash(pin, 10)
    }
    const barbero = await prisma.barbero.update({
      where: { id: Number(req.params.id) },
      data
    })
    res.json(barbero)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} */
const crearBarbero = async (req, res) => {
  try {
    const { nombre, especialidad, descripcion, foto, pin } = req.body
    if (!nombre || !especialidad) {
      return res.status(400).json({ error: 'Nombre y especialidad son obligatorios' })
    }
    const data = { nombre, especialidad, descripcion, foto }
    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'El PIN debe ser exactamente 4 dígitos numéricos' })
      }
      data.pin = await bcrypt.hash(pin, 10)
    }
    const barbero = await prisma.barbero.create({ data })
    res.status(201).json(barbero)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const actualizarBarbero = async (req, res) => {
  try {
    const { nombre, especialidad, descripcion, foto, activo, pin } = req.body
    const data = { nombre, especialidad, descripcion, foto, activo }
    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'El PIN debe ser exactamente 4 dígitos numéricos' })
      }
      data.pin = await bcrypt.hash(pin, 10)
    }
    const barbero = await prisma.barbero.update({
      where: { id: Number(req.params.id) },
      data
    })
    res.json(barbero)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
// DELETE /api/barberos/:id
const eliminarBarbero = async (req, res) => {
  try {
    await prisma.barbero.update({
      where: { id: Number(req.params.id) },
      data: { activo: false }
    })
    res.json({ mensaje: 'Barbero eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  obtenerBarberos,
  obtenerBarbero,
  crearBarbero,
  actualizarBarbero,
  eliminarBarbero
}