const express = require('express')
const router = express.Router()
const {
  agendarCita,
  obtenerCitas,
  misCitas,
  obtenerCita,
  cambiarEstado,
  cancelarCita,
  horasOcupadas,
  slotsDisponibles,
  agendaDeHoy,
  walkIn
} = require('../controllers/citas.controller')
const { verificarToken, verificarBarberoToken, soloAdmin, permitirRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { citaSchema, estadoSchema } = require('../validators/citas.validator')
const prisma = require('../prisma')
const ventasService = require('../services/ventas.service')

// ── Rutas fijas primero (antes de /:id) ──

router.post('/', verificarToken, validate(citaSchema), agendarCita)
router.get('/', verificarToken, soloAdmin, obtenerCitas)
router.get('/mis-citas', verificarToken, misCitas)
router.get('/horas-ocupadas', horasOcupadas)
router.get('/slots-disponibles', slotsDisponibles)
router.get('/hoy', verificarToken, permitirRoles('ADMIN', 'RECEPCION'), agendaDeHoy)
router.post('/walk-in', verificarToken, permitirRoles('ADMIN', 'RECEPCION'), walkIn)

router.get('/barbero/:barberoId', verificarBarberoToken, async (req, res) => {
  try {
    if (req.barbero.barberoId !== Number(req.params.barberoId)) {
      return res.status(403).json({ error: 'No puedes ver citas de otro barbero' })
    }

    const ahoraUTC = new Date()
    const ahoraBogota = new Date(ahoraUTC.getTime() - 5 * 60 * 60 * 1000)
    const hoy = new Date(Date.UTC(ahoraBogota.getUTCFullYear(), ahoraBogota.getUTCMonth(), ahoraBogota.getUTCDate()))
    const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000)

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

    // El barbero sigue haciendo exactamente lo mismo de siempre.
    // Esto solo agrega, en segundo plano, el registro de venta
    // pendiente de cobro para que recepción/admin lo vean en caja.
    if (estado === 'COMPLETADA') {
      await ventasService.crearVentaPendienteDeCita(cita.id)
    }

    res.json(cita)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// ── Rutas con parámetro /:id al final ──
router.get('/:id', verificarToken, obtenerCita)
router.put('/:id/estado', verificarToken, permitirRoles('ADMIN', 'RECEPCION'), validate(estadoSchema), cambiarEstado)
router.delete('/:id', verificarToken, cancelarCita)

module.exports = router