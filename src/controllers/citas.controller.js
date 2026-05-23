const prisma = require('../prisma')

// POST /api/citas
const agendarCita = async (req, res) => {
  try {
    const { barberoId, fecha, hora, servicioIds, nota } = req.body
    const usuarioId = req.usuario.id

    // Verificar que el barbero existe
    const barbero = await prisma.barbero.findUnique({
      where: { id: Number(barberoId) }
    })
    if (!barbero) {
      return res.status(404).json({ error: 'Barbero no encontrado' })
    }

    // Verificar que no hay otra cita en la misma fecha y hora con ese barbero
    const citaExiste = await prisma.cita.findFirst({
      where: {
        barberoId: Number(barberoId),
        fecha: new Date(fecha),
        hora,
        estado: { not: 'CANCELADA' }
      }
    })
    if (citaExiste) {
      return res.status(400).json({ error: 'Ese horario ya está ocupado' })
    }

    // Crear la cita con los servicios
    const cita = await prisma.cita.create({
      data: {
        usuarioId,
        barberoId: Number(barberoId),
        fecha: new Date(fecha),
        hora,
        nota,
        servicios: {
          create: servicioIds.map(id => ({
            servicio: { connect: { id: Number(id) } }
          }))
        }
      },
      include: {
        barbero: true,
        usuario: { select: { id: true, nombre: true, email: true } },
        servicios: { include: { servicio: true } }
      }
    })

    res.status(201).json(cita)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/citas — solo admin
const obtenerCitas = async (req, res) => {
  try {
    const citas = await prisma.cita.findMany({
      include: {
        barbero: true,
        usuario: { select: { id: true, nombre: true, email: true, telefono: true } },
        servicios: { include: { servicio: true } }
      },
      orderBy: { fecha: 'asc' }
    })
    res.json(citas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/citas/mis-citas — cliente ve sus propias citas
const misCitas = async (req, res) => {
  try {
    const citas = await prisma.cita.findMany({
      where: { usuarioId: req.usuario.id },
      include: {
        barbero: true,
        servicios: { include: { servicio: true } }
      },
      orderBy: { fecha: 'asc' }
    })
    res.json(citas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/citas/:id
const obtenerCita = async (req, res) => {
  try {
    const cita = await prisma.cita.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        barbero: true,
        usuario: { select: { id: true, nombre: true, email: true } },
        servicios: { include: { servicio: true } }
      }
    })
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }
    res.json(cita)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/citas/:id/estado — solo admin
const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body
    const cita = await prisma.cita.update({
      where: { id: Number(req.params.id) },
      data: { estado }
    })
    res.json(cita)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE /api/citas/:id — cliente cancela su cita
const cancelarCita = async (req, res) => {
  try {
    const cita = await prisma.cita.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }
    if (cita.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: 'No puedes cancelar una cita que no es tuya' })
    }
    await prisma.cita.update({
      where: { id: Number(req.params.id) },
      data: { estado: 'CANCELADA' }
    })
    res.json({ mensaje: 'Cita cancelada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/citas/horas-ocupadas
const horasOcupadas = async (req, res) => {
  try {
    const { barberoId, fecha } = req.query
    if (!barberoId || !fecha) {
      return res.status(400).json({ error: 'barberoId y fecha son requeridos' })
    }
    const citas = await prisma.cita.findMany({
      where: {
        barberoId: Number(barberoId),
        fecha: new Date(fecha),
        estado: { not: 'CANCELADA' }
      },
      select: { hora: true }
    })
    res.json(citas.map(c => c.hora))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  agendarCita,
  obtenerCitas,
  misCitas,
  obtenerCita,
  cambiarEstado,
  cancelarCita,
  horasOcupadas
}