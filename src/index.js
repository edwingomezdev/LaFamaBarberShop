// ── 1. Variables de entorno (valida y aborta si faltan) ──────────────────────
const env = require('./config/env')

// ── 2. Dependencias externas ──────────────────────────────────────────────────
const express = require('express')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const session = require('express-session')

// ── 3. Config interna ─────────────────────────────────────────────────────────
const logger = require('./config/logger')
const passport = require('./config/passport')
const swaggerSpec = require('./swagger')
const { errorHandler } = require('./middlewares/error.middleware')

// ── 4. Rutas ──────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes')
const serviciosRoutes = require('./routes/servicios.routes')
const barberosRoutes  = require('./routes/barberos.routes')
const citasRoutes     = require('./routes/citas.routes')
const imagenesRoutes  = require('./routes/imagenes.routes')
const productosRoutes = require('./routes/productos.routes')
const membresiasRoutes = require('./routes/membresias.routes')
const usuariosRoutes  = require('./routes/usuarios.routes')
const estilosCorteRoutes = require('./routes/estilosCorte.routes')

// ── 5. Jobs ───────────────────────────────────────────────────────────────────
const cancelarCitasPendientes   = require('./jobs/cancelarCitas.job')
const { verificarMembresiasVencidas } = require('./controllers/membresias.controller')

// ─────────────────────────────────────────────────────────────────────────────
const app = express()

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(session({ secret: env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

// ── Archivos estáticos ────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Documentación ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/servicios',  serviciosRoutes)
app.use('/api/barberos',   barberosRoutes)
app.use('/api/citas',      citasRoutes)
app.use('/api/imagenes',   imagenesRoutes)
app.use('/api/productos',  productosRoutes)
app.use('/api/membresias', membresiasRoutes)
app.use('/api/usuarios',   usuariosRoutes)
app.use('/api/estilos-cortes', estilosCorteRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'La Fama Barber Shop API',
    version: '1.0.0',
    status: 'ok',
    docs: `http://localhost:${env.PORT}/api-docs`,
  })
})

// ── Manejo de errores (siempre al final) ──────────────────────────────────────
app.use(errorHandler)

// ── Arranque ──────────────────────────────────────────────────────────────────
const PORT = Number(env.PORT)

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  logger.info(`📖 Documentación en http://localhost:${PORT}/api-docs`)

  const runJobs = async () => {
    const results = await Promise.allSettled([
      cancelarCitasPendientes(),
      verificarMembresiasVencidas(),
    ])

    results.forEach((result) => {
      if (result.status === 'rejected') {
        logger.error({ err: result.reason }, 'Error ejecutando jobs programados')
      }
    })
  }
  runJobs()
  setInterval(runJobs, 30 * 60 * 1000)
})

// ── Manejo de errores no capturados ──────────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaughtException — cerrando proceso')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection — cerrando proceso')
  process.exit(1)
})
