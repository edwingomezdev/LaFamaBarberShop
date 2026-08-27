const { z } = require('zod')

const metodoPagoEnum = z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'], {
  errorMap: () => ({ message: 'Método de pago inválido' }),
})

const cobrarSchema = z.object({
  metodoPago: metodoPagoEnum,
  extras: z.array(
    z.object({
      descripcion: z.string().min(1, 'La descripción del extra es requerida'),
      precio: z.number({ invalid_type_error: 'El precio debe ser un número' }).nonnegative(),
    })
  ).optional(),
})

const venderProductosSchema = z.object({
  metodoPago: metodoPagoEnum,
  productos: z.array(
    z.object({
      productoId: z.number({ invalid_type_error: 'productoId debe ser un número' }),
      cantidad: z.number({ invalid_type_error: 'cantidad debe ser un número' }).int().positive(),
    })
  ).min(1, 'Debes incluir al menos un producto'),
})

module.exports = { cobrarSchema, venderProductosSchema }
