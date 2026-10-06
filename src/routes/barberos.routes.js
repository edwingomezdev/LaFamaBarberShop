const express = require('express')
const router = express.Router()
const prisma = require('../prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const env = require('../config/env')
const {
  obtenerBarberos,
  obtenerBarbero,
  crearBarbero,
  actualizarBarbero,
  eliminarBarbero
} = require('../controllers/barberos.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

// Login barbero con PIN — debe ir ANTES de /:id
const pinAttempts = new Map()

router.post('/login', async (req, res) => {
  try {
    const { barberoId, pin } = req.body
    const ip = req.ip || req.connection.remoteAddress
    const key = `${ip}_${barberoId}`

    if (!barberoId || !pin) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Verificar bloqueo
    const attempts = pinAttempts.get(key) || { count: 0, lastAttempt: null }
    if (attempts.count >= 5) {
      const minutosBloqueo = 15
      const tiempoTranscurrido = (Date.now() - attempts.lastAttempt) / 1000 / 60
      if (tiempoTranscurrido < minutosBloqueo) {
        const minutosRestantes = Math.ceil(minutosBloqueo - tiempoTranscurrido)
        return res.status(429).json({
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutosRestantes} minuto(s)`
        })
      } else {
        pinAttempts.delete(key)
      }
    }

    const barbero = await prisma.barbero.findUnique({
      where: { id: Number(barberoId) }
    })

    if (!barbero || !barbero.activo) {
      return res.status(404).json({ error: 'Barbero no encontrado' })
    }

    if (!barbero.pin) {
      return res.status(401).json({ error: 'Este barbero no tiene PIN asignado' })
    }

    const pinValido = await bcrypt.compare(pin, barbero.pin)
    if (!pinValido) {
      pinAttempts.set(key, { count: (attempts.count || 0) + 1, lastAttempt: Date.now() })
      return res.status(401).json({ error: 'PIN incorrecto' })
    }

    // Login exitoso — limpiar intentos
    pinAttempts.delete(key)

    res.json({
      mensaje: 'Acceso concedido',
      token: jwt.sign(
        { barberoId: barbero.id, tipo: 'BARBERO' },
        env.JWT_SECRET,
        { expiresIn: '12h' }
      ),
      barbero: {
        id: barbero.id,
        nombre: barbero.nombre,
        especialidad: barbero.especialidad
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Rutas públicas
router.get('/', obtenerBarberos)

// Días de descanso — antes de /:id para que no choque con el genérico
router.get('/:id/dias-descanso', async (req, res, next) => {
  try {
    res.json(await require('../services/barberos.service').listarDiasDescanso(req.params.id))
  } catch (err) { next(err) }
})
router.post('/:id/dias-descanso', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await require('../services/barberos.service').crearDiaDescanso(req.params.id, req.body))
  } catch (err) { next(err) }
})
router.delete('/dias-descanso/:id', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    await require('../services/barberos.service').eliminarDiaDescanso(req.params.id)
    res.json({ mensaje: 'Día de descanso eliminado' })
  } catch (err) { next(err) }
})

// Reordenar — también antes de /:id
router.put('/reordenar', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    await require('../services/barberos.service').reordenar(req.body.orden)
    res.json({ mensaje: 'Orden actualizado' })
  } catch (err) { next(err) }
})

router.get('/:id', obtenerBarbero)

// Rutas solo admin
router.post('/', verificarToken, soloAdmin, crearBarbero)
router.put('/:id', verificarToken, soloAdmin, actualizarBarbero)
router.delete('/:id', verificarToken, soloAdmin, eliminarBarbero)

module.exports = router
