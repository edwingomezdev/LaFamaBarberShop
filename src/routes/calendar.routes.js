const express = require('express')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')
const googleCalendar = require('../services/googleCalendar.service')
const router = express.Router()

router.get('/status', verificarToken, soloAdmin, async (req, res, next) => {
  try { res.json(await googleCalendar.status()) } catch (error) { next(error) }
})
router.post('/connect-url', verificarToken, soloAdmin, (req, res, next) => {
  try { res.json({ url: googleCalendar.getConnectUrl() }) } catch (error) { next(error) }
})
router.get('/callback', async (req, res) => {
  try {
    if (req.query.error) throw new Error(`Google rechazó la conexión: ${req.query.error}`)
    if (!req.query.code || !req.query.state) throw new Error('Falta el código o el estado de autorización de Google')
    await googleCalendar.connect(req.query.code, req.query.state)
    res.status(200).send('<!doctype html><html lang="es"><meta charset="utf-8"><title>Calendario conectado</title><body style="font:16px system-ui;max-width:560px;margin:12vh auto;padding:24px;background:#111;color:#eee"><h1>Google Calendar conectado</h1><p>La sincronización de citas quedó activa. Puedes cerrar esta ventana y volver al panel.</p><script>setTimeout(()=>window.close(),2500)</script></body></html>')
  } catch (error) {
    console.error('No se pudo conectar Google Calendar:', error.message)
    res.status(400).send(`<h1>No se pudo conectar Google Calendar</h1><p>${String(error.message).replace(/[<>]/g, '')}</p>`) 
  }
})
module.exports = router
