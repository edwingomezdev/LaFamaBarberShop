const { z } = require('zod')

const servicioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  precio: z.number({ invalid_type_error: 'El precio debe ser un número' }).positive('El precio debe ser mayor a 0'),
  duracion: z.number({ invalid_type_error: 'La duración debe ser un número' }).positive('La duración debe ser mayor a 0')
})

module.exports = { servicioSchema }