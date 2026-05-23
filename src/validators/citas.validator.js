const { z } = require('zod')

const citaSchema = z.object({
  barberoId: z.number({ invalid_type_error: 'barberoId debe ser un número' }),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  servicioIds: z.array(z.number()).min(1, 'Debes seleccionar al menos un servicio'),
  nota: z.string().optional()
})

const estadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'], {
    errorMap: () => ({ message: 'Estado inválido' })
  })
})

module.exports = { citaSchema, estadoSchema }