const express = require('express')
const router = express.Router()
const {
  agendarCita,
  obtenerCitas,
  misCitas,
  obtenerCita,
  cambiarEstado,
  cancelarCita,
  horasOcupadas
} = require('../controllers/citas.controller')
const { verificarToken, verificarBarberoToken, soloAdmin } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { citaSchema, estadoSchema } = require('../validators/citas.validator')
const prisma = require('../prisma')

// ── Rutas fijas primero (antes de /:id) ──

router.post('/', verificarToken, validate(citaSchema), agendarCita)
router.get('/', verificarToken, soloAdmin, obtenerCitas)
router.get('/mis-citas', verificarToken, misCitas)
router.get('/horas-ocupadas', horasOcupadas)

router.get('/barbero/:barberoId', verificarBarberoToken, async (req, res) => {
  try {
    if (req.barbero.barberoId !== Number(req.params.barberoId)) {
      return res.status(403).json({ error: 'No puedes ver citas de otro barbero' })
    }

    const ahora = new Date()
    const hoy = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()))
    const manana = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1))

    const citas = await prisma.cita.findMany({
      where: {
        barberoId: Number(req.params.barberoId),
        fecha: { gte: hoy, lt: manana },
        estado: { not: 'CANCELADA' }
      },
      include: {
        usuario: { select: { nombre: true, telefono: true } },
        servicios: { include: { servicio: true } }
      },
      orderBy: { hora: 'asc' }
    })
    res.json(citas)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Barbero cambia estado con token y solo sobre sus citas
router.put('/barbero/:citaId/estado', verificarBarberoToken, async (req, res) => {
  try {
    const { estado } = req.body
    const estadosValidos = ['CONFIRMADA', 'COMPLETADA']
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' })
    }
    const actual = await prisma.cita.findUnique({ where: { id: Number(req.params.citaId) } })
    if (!actual) return res.status(404).json({ error: 'Cita no encontrada' })
    if (actual.barberoId !== req.barbero.barberoId) {
      return res.status(403).json({ error: 'No puedes modificar citas de otro barbero' })
    }

    const cita = await prisma.cita.update({
      where: { id: Number(req.params.citaId) },
      data: { estado }
    })
    res.json(cita)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// ── Rutas con parámetro /:id al final ──
router.get('/:id', verificarToken, obtenerCita)
router.put('/:id/estado', verificarToken,  validate(estadoSchema), cambiarEstado)
router.delete('/:id', verificarToken, cancelarCita)

module.exports = router
