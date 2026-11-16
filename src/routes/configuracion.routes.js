const express = require('express')
const router = express.Router()
const configuracionService = require('../services/configuracion.service')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')
const { z } = require('zod')

const horariosSchema = z.array(z.object({
  diaSemana: z.number().int().min(0).max(6),
  abierto: z.boolean(),
  horaApertura: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  horaCierre: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})).length(7).refine((items) => new Set(items.map((item) => item.diaSemana)).size === 7, 'Debe haber un horario único para cada día')
  .refine((items) => items.every((item) => !item.abierto || item.horaApertura < item.horaCierre), 'La hora de cierre debe ser posterior a la apertura')

// Pública: el frontend la usa para decidir si muestra los links/páginas
// de Productos y Membresías.
router.get('/', async (req, res, next) => {
  try {
    res.json(await configuracionService.obtener())
  } catch (err) { next(err) }
})

// Solo admin puede cambiar los interruptores.
router.put('/', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    res.json(await configuracionService.actualizar(req.body))
  } catch (err) { next(err) }
})

router.get('/horarios', verificarToken, soloAdmin, async (req, res, next) => {
  try { res.json(await configuracionService.obtenerHorarios()) } catch (err) { next(err) }
})

router.put('/horarios', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    const validation = horariosSchema.safeParse(req.body)
    if (!validation.success) return res.status(400).json({ error: validation.error.issues[0]?.message || 'Horarios inválidos' })
    res.json(await configuracionService.actualizarHorarios(validation.data))
  } catch (err) { next(err) }
})

module.exports = router
