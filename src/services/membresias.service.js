const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')
const logger = require('../config/logger')

const MAX_MESES = 2

const listar = () =>
  prisma.membresia.findMany({ where: { activo: true }, orderBy: { precio: 'asc' } })

const crear = ({ nombre, precio, cortesIncluidos, descripcion, beneficios, descuento }) =>
  prisma.membresia.create({
    data: { nombre, precio: Number(precio), cortesIncluidos: Number(cortesIncluidos), descripcion, beneficios, descuento: Number(descuento) || 0 },
  })

const actualizar = (id, data) =>
  prisma.membresia.update({ where: { id: Number(id) }, data })

const eliminar = (id) =>
  prisma.membresia.update({ where: { id: Number(id) }, data: { activo: false } })

const asignar = async ({ usuarioId, membresiaId, fechaFin }) => {
  if (!usuarioId || !membresiaId || !fechaFin) throw createError(400, 'Datos incompletos')

  // Validar fecha ANTES de tocar la BD
  const fechaFinDate = new Date(fechaFin)
  const fechaMax = new Date()
  fechaMax.setMonth(fechaMax.getMonth() + MAX_MESES)
  if (fechaFinDate > fechaMax) throw createError(400, `La membresía no puede superar ${MAX_MESES} meses de vigencia`)

  const [usuario, membresia] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: Number(usuarioId) } }),
    prisma.membresia.findUnique({ where: { id: Number(membresiaId) } }),
  ])
  if (!usuario) throw createError(404, 'Usuario no encontrado')
  if (!membresia) throw createError(404, 'Membresía no encontrada')

  await prisma.usuarioMembresia.updateMany({
    where: { usuarioId: Number(usuarioId), estado: 'ACTIVA' },
    data: { estado: 'CANCELADA' },
  })

  return prisma.usuarioMembresia.create({
    data: { usuarioId: Number(usuarioId), membresiaId: Number(membresiaId), fechaFin: fechaFinDate, estado: 'ACTIVA', cortesUsados: 0 },
    include: { usuario: { select: { id: true, nombre: true, email: true } }, membresia: true },
  })
}

const listarAsignaciones = () =>
  prisma.usuarioMembresia.findMany({
    include: { usuario: { select: { id: true, nombre: true, email: true, telefono: true } }, membresia: true },
    orderBy: { createdAt: 'desc' },
  })

const miMembresia = (usuarioId) =>
  prisma.usuarioMembresia.findFirst({
    where: { usuarioId, estado: 'ACTIVA' },
    include: { membresia: true },
  })

const miMembresiaDetalle = async (usuarioId) => {
  const um = await prisma.usuarioMembresia.findFirst({
    where: { usuarioId, estado: 'ACTIVA' },
    include: { membresia: true },
  })
  if (!um) return null

  const hoy = new Date()
  const diasRestantes = Math.ceil((new Date(um.fechaFin) - hoy) / 86400000)
  const cortesRestantes = um.membresia.cortesIncluidos - um.cortesUsados
  const vencida = diasRestantes <= 0 || cortesRestantes <= 0

  if (vencida) {
    await prisma.usuarioMembresia.update({ where: { id: um.id }, data: { estado: 'VENCIDA' } })
    return null
  }

  return {
    ...um,
    diasRestantes: Math.max(0, diasRestantes),
    cortesRestantes: Math.max(0, cortesRestantes),
    porcentajeUso: Math.round((um.cortesUsados / um.membresia.cortesIncluidos) * 100),
    alertaVencimiento: diasRestantes <= 7,
    alertaConsumo: cortesRestantes === 1,
  }
}

const eliminarAsignacion = (id) =>
  prisma.usuarioMembresia.delete({ where: { id: Number(id) } })

const verificarVencidas = async () => {
  const result = await prisma.usuarioMembresia.updateMany({
    where: { estado: 'ACTIVA', fechaFin: { lt: new Date() } },
    data: { estado: 'VENCIDA' },
  })
  if (result.count > 0) logger.info(`${result.count} membresía(s) marcadas como VENCIDAS`)
}

module.exports = { listar, crear, actualizar, eliminar, asignar, listarAsignaciones, miMembresia, miMembresiaDetalle, eliminarAsignacion, verificarVencidas }
