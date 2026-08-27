const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')

const VENTA_INCLUDE = {
  cita: {
    include: {
      barbero: true,
      usuario: { select: { id: true, nombre: true } },
      servicios: { include: { servicio: true } },
    },
  },
  itemsExtra: true,
  productos: { include: { producto: true } },
  cobradoPor: { select: { id: true, nombre: true } },
}

/**
 * Devuelve el rango [inicio, fin) del "día de hoy" en hora de Colombia
 * (America/Bogota, UTC-5 todo el año, sin horario de verano),
 * para que la caja del día no se desfase por la zona horaria del servidor.
 */
const rangoHoyBogota = () => {
  const ahoraUTC = new Date()
  // Offset fijo de Bogotá: UTC-5
  const ahoraBogota = new Date(ahoraUTC.getTime() - 5 * 60 * 60 * 1000)

  const inicioBogota = new Date(Date.UTC(
    ahoraBogota.getUTCFullYear(),
    ahoraBogota.getUTCMonth(),
    ahoraBogota.getUTCDate(),
    5, 0, 0, 0 // 00:00 Bogotá = 05:00 UTC
  ))
  const finBogota = new Date(inicioBogota.getTime() + 24 * 60 * 60 * 1000)

  return { inicio: inicioBogota, fin: finBogota }
}

/**
 * Se llama automáticamente cuando una Cita pasa a estado COMPLETADA
 * (tanto si la finaliza el barbero como si la finaliza el admin).
 * Crea la Venta en estado "pendiente de cobro" con el subtotal ya
 * calculado a partir de los servicios de la cita. Es idempotente:
 * si ya existe una Venta para esa cita, no hace nada.
 */
const crearVentaPendienteDeCita = async (citaId) => {
  const existente = await prisma.venta.findUnique({ where: { citaId } })
  if (existente) return existente

  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: { servicios: { include: { servicio: true } } },
  })

  if (!cita) return null

  const subtotalServicios = cita.servicios.reduce(
    (total, cs) => total + cs.servicio.precio,
    0
  )

  return prisma.venta.create({
    data: {
      citaId: cita.id,
      barberoId: cita.barberoId,
      subtotalServicios,
      subtotalExtras: 0,
      subtotalProductos: 0,
      total: subtotalServicios,
      cobrado: false,
    },
  })
}

/**
 * Lista las ventas pendientes de cobro (citas ya finalizadas por el
 * barbero, esperando que recepción/admin las cobre en el mostrador).
 */
const listarPendientesDeCobro = () =>
  prisma.venta.findMany({
    where: { cobrado: false, citaId: { not: null } },
    include: VENTA_INCLUDE,
    orderBy: { createdAt: 'asc' },
  })

/**
 * Cobra una venta pendiente (asociada a una cita). Permite anexar
 * extras de palabra (ceja, barba, etc.) que no estaban en la cita
 * original, y define el método de pago.
 *
 * extras: [{ descripcion, precio }]
 */
const cobrarVenta = async (ventaId, { metodoPago, extras = [], cobradoPorId }) => {
  const venta = await prisma.venta.findUnique({ where: { id: ventaId } })

  if (!venta) throw createError(404, 'Venta no encontrada')
  if (venta.cobrado) throw createError(400, 'Esta venta ya fue cobrada')

  const subtotalExtras = extras.reduce((total, item) => total + Number(item.precio || 0), 0)
  const total = venta.subtotalServicios + subtotalExtras + venta.subtotalProductos

  return prisma.$transaction(async (tx) => {
    if (extras.length > 0) {
      await tx.ventaExtra.createMany({
        data: extras.map((item) => ({
          ventaId: venta.id,
          descripcion: item.descripcion,
          precio: Number(item.precio),
        })),
      })
    }

    return tx.venta.update({
      where: { id: venta.id },
      data: {
        subtotalExtras,
        total,
        metodoPago,
        cobrado: true,
        cobradoPorId,
        fechaCobro: new Date(),
      },
      include: VENTA_INCLUDE,
    })
  })
}

/**
 * Venta de producto en tienda, sin cita asociada. Descuenta el stock
 * en la misma transacción y valida que haya suficiente antes de vender.
 *
 * productos: [{ productoId, cantidad }]
 */
const venderProductos = async ({ productos, metodoPago, cobradoPorId }) => {
  if (!Array.isArray(productos) || productos.length === 0) {
    throw createError(400, 'Debes incluir al menos un producto')
  }

  return prisma.$transaction(async (tx) => {
    let subtotalProductos = 0
    const itemsParaCrear = []

    for (const item of productos) {
      const producto = await tx.producto.findUnique({ where: { id: Number(item.productoId) } })

      if (!producto || !producto.activo) {
        throw createError(400, `Producto ${item.productoId} no disponible`)
      }
      if (producto.stock < item.cantidad) {
        throw createError(400, `Stock insuficiente de "${producto.nombre}" (disponible: ${producto.stock})`)
      }

      await tx.producto.update({
        where: { id: producto.id },
        data: { stock: { decrement: item.cantidad } },
      })

      subtotalProductos += producto.precio * item.cantidad
      itemsParaCrear.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnit: producto.precio,
      })
    }

    return tx.venta.create({
      data: {
        subtotalServicios: 0,
        subtotalExtras: 0,
        subtotalProductos,
        total: subtotalProductos,
        metodoPago,
        cobrado: true,
        cobradoPorId,
        fechaCobro: new Date(),
        productos: { create: itemsParaCrear },
      },
      include: VENTA_INCLUDE,
    })
  })
}

/**
 * Caja del día: todas las ventas ya cobradas hoy (hora Bogotá),
 * con el total general y el desglose por método de pago y por barbero.
 */
const cajaDelDia = async () => {
  const { inicio, fin } = rangoHoyBogota()

  const ventas = await prisma.venta.findMany({
    where: {
      cobrado: true,
      fechaCobro: { gte: inicio, lt: fin },
    },
    include: VENTA_INCLUDE,
    orderBy: { fechaCobro: 'desc' },
  })

  const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0)

  const porMetodoPago = ventas.reduce((acc, v) => {
    acc[v.metodoPago] = (acc[v.metodoPago] || 0) + v.total
    return acc
  }, {})

  const porBarbero = ventas.reduce((acc, v) => {
    const nombre = v.cita?.barbero?.nombre || 'Sin barbero (producto)'
    acc[nombre] = (acc[nombre] || 0) + v.total
    return acc
  }, {})

  return { ventas, totalGeneral, porMetodoPago, porBarbero }
}

module.exports = {
  crearVentaPendienteDeCita,
  listarPendientesDeCobro,
  cobrarVenta,
  venderProductos,
  cajaDelDia,
}
