/* const prisma = require('../prisma')

const obtenerMembresias = async (req, res) => {
  try {
    const membresias = await prisma.membresia.findMany({
      where: { activo: true },
      orderBy: { precio: 'asc' }
    })
    res.json(membresias)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const crearMembresia = async (req, res) => {
  try {
    const { nombre, precio, cortesIncluidos, descripcion, beneficios, descuento } = req.body
    const membresia = await prisma.membresia.create({
      data: { nombre, precio: Number(precio), cortesIncluidos: Number(cortesIncluidos), descripcion, beneficios, descuento: Number(descuento) || 0 }
    })
    res.status(201).json(membresia)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const actualizarMembresia = async (req, res) => {
  try {
    const { nombre, precio, cortesIncluidos, descripcion, beneficios, descuento, activo } = req.body
    const membresia = await prisma.membresia.update({
      where: { id: Number(req.params.id) },
      data: { nombre, precio: Number(precio), cortesIncluidos: Number(cortesIncluidos), descripcion, beneficios, descuento: Number(descuento), activo }
    })
    res.json(membresia)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const eliminarMembresia = async (req, res) => {
  try {
    await prisma.membresia.update({
      where: { id: Number(req.params.id) },
      data: { activo: false }
    })
    res.json({ mensaje: 'Membresía eliminada' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Asignar membresía a usuario (admin)
const asignarMembresia = async (req, res) => {
  try {
    const { usuarioId, membresiaId, fechaFin } = req.body
    if (!usuarioId || !membresiaId || !fechaFin) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }
    // Verificar que usuario y membresía existen
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } })
    const membresia = await prisma.membresia.findUnique({ where: { id: Number(membresiaId) } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    if (!membresia) return res.status(404).json({ error: 'Membresía no encontrada' })

    // Cancelar membresía activa anterior si existe
    await prisma.usuarioMembresia.updateMany({
      where: { usuarioId: Number(usuarioId), estado: 'ACTIVA' },
      data: { estado: 'CANCELADA' }
    })

    const asignacion = await prisma.usuarioMembresia.create({
      data: {
        usuarioId: Number(usuarioId),
        membresiaId: Number(membresiaId),
        fechaFin: new Date(fechaFin),
        estado: 'ACTIVA',
        cortesUsados: 0
      },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        membresia: true
      }
    })
    res.status(201).json(asignacion)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Obtener todas las asignaciones (admin)
const obtenerAsignaciones = async (req, res) => {
  try {
    const asignaciones = await prisma.usuarioMembresia.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, email: true, telefono: true } },
        membresia: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(asignaciones)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Membresía activa del usuario logueado
const miMembresia = async (req, res) => {
  try {
    const membresia = await prisma.usuarioMembresia.findFirst({
      where: { usuarioId: req.usuario.id, estado: 'ACTIVA' },
      include: { membresia: true }
    })
    res.json(membresia || null)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

module.exports = {
  obtenerMembresias,
  crearMembresia,
  actualizarMembresia,
  eliminarMembresia,
  asignarMembresia,
  obtenerAsignaciones,
  miMembresia
}


 */

const prisma = require('../prisma')

const obtenerMembresias = async (req, res) => {
  try {
    const membresias = await prisma.membresia.findMany({
      where: { activo: true },
      orderBy: { precio: 'asc' }
    })
    res.json(membresias)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const crearMembresia = async (req, res) => {
  try {
    const { nombre, precio, cortesIncluidos, descripcion, beneficios, descuento } = req.body
    const membresia = await prisma.membresia.create({
      data: { nombre, precio: Number(precio), cortesIncluidos: Number(cortesIncluidos), descripcion, beneficios, descuento: Number(descuento) || 0 }
    })
    res.status(201).json(membresia)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const actualizarMembresia = async (req, res) => {
  try {
    const { nombre, precio, cortesIncluidos, descripcion, beneficios, descuento, activo } = req.body
    const membresia = await prisma.membresia.update({
      where: { id: Number(req.params.id) },
      data: { nombre, precio: Number(precio), cortesIncluidos: Number(cortesIncluidos), descripcion, beneficios, descuento: Number(descuento), activo }
    })
    res.json(membresia)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const eliminarMembresia = async (req, res) => {
  try {
    await prisma.membresia.update({
      where: { id: Number(req.params.id) },
      data: { activo: false }
    })
    res.json({ mensaje: 'Membresía eliminada' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const asignarMembresia = async (req, res) => {
  try {
    const { usuarioId, membresiaId, fechaFin } = req.body
    if (!usuarioId || !membresiaId || !fechaFin) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } })
    const membresia = await prisma.membresia.findUnique({ where: { id: Number(membresiaId) } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    if (!membresia) return res.status(404).json({ error: 'Membresía no encontrada' })

    await prisma.usuarioMembresia.updateMany({
      where: { usuarioId: Number(usuarioId), estado: 'ACTIVA' },
      data: { estado: 'CANCELADA' }
    })

    const asignacion = await prisma.usuarioMembresia.create({
      data: {
        usuarioId: Number(usuarioId),
        membresiaId: Number(membresiaId),
        fechaFin: new Date(fechaFin),
        estado: 'ACTIVA',
        cortesUsados: 0
      },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        membresia: true
      }
    })
    // Validar máximo 2 meses
    const fechaMax = new Date()
    fechaMax.setMonth(fechaMax.getMonth() + 2)
    if (new Date(fechaFin) > fechaMax) {
      return res.status(400).json({ error: 'La membresía no puede superar 2 meses de vigencia' })
    }
    res.status(201).json(asignacion)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const obtenerAsignaciones = async (req, res) => {
  try {
    const asignaciones = await prisma.usuarioMembresia.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, email: true, telefono: true } },
        membresia: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(asignaciones)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const miMembresia = async (req, res) => {
  try {
    const membresia = await prisma.usuarioMembresia.findFirst({
      where: { usuarioId: req.usuario.id, estado: 'ACTIVA' },
      include: { membresia: true }
    })
    res.json(membresia || null)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// ── NUEVO: Membresía detallada con alertas (cliente) ──
const miMembresiaDetalle = async (req, res) => {
  try {
    const membresia = await prisma.usuarioMembresia.findFirst({
      where: { usuarioId: req.usuario.id, estado: 'ACTIVA' },
      include: { membresia: true }
    })

    if (!membresia) return res.json(null)

    const hoy = new Date()
    const diasRestantes = Math.ceil((new Date(membresia.fechaFin) - hoy) / (1000 * 60 * 60 * 24))
    const cortesRestantes = membresia.membresia.cortesIncluidos - membresia.cortesUsados
    const vencida = diasRestantes <= 0 || cortesRestantes <= 0

    if (vencida) {
      await prisma.usuarioMembresia.update({
        where: { id: membresia.id },
        data: { estado: 'VENCIDA' }
      })
      return res.json(null)
    }

    res.json({
      ...membresia,
      diasRestantes: Math.max(0, diasRestantes),
      cortesRestantes: Math.max(0, cortesRestantes),
      porcentajeUso: Math.round((membresia.cortesUsados / membresia.membresia.cortesIncluidos) * 100),
      alertaVencimiento: diasRestantes <= 7,
      alertaConsumo: cortesRestantes === 1
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// ── NUEVO: Eliminar asignación (admin) ──
const eliminarAsignacion = async (req, res) => {
  try {
    await prisma.usuarioMembresia.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ mensaje: 'Membresía eliminada del usuario' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

// ── NUEVO: Job verificar membresías vencidas ──
const verificarMembresiasVencidas = async () => {
  try {
    const hoy = new Date()
    const result = await prisma.usuarioMembresia.updateMany({
      where: { estado: 'ACTIVA', fechaFin: { lt: hoy } },
      data: { estado: 'VENCIDA' }
    })
    if (result.count > 0) {
      console.log(`⚠️  ${result.count} membresía(s) marcadas como VENCIDAS`)
    }
  } catch (e) {
    console.error('Error verificando membresías vencidas:', e)
  }
}

module.exports = {
  obtenerMembresias,
  crearMembresia,
  actualizarMembresia,
  eliminarMembresia,
  asignarMembresia,
  obtenerAsignaciones,
  miMembresia,
  miMembresiaDetalle,
  eliminarAsignacion,
  verificarMembresiasVencidas
}