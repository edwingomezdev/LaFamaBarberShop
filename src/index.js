const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

dotenv.config()

const app = express()

const session = require('express-session')
const passport = require('./config/passport')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ── DOCUMENTACIÓN ──
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ── RUTAS ──
const authRoutes = require('./routes/auth.routes')
const serviciosRoutes = require('./routes/servicios.routes')
const barberosRoutes = require('./routes/barberos.routes')
const citasRoutes = require('./routes/citas.routes')
const imagenesRoutes = require('./routes/imagenes.routes')
const productosRoutes = require('./routes/productos.routes')
const membresiasRoutes = require('./routes/membresias.routes')
//const usuariosRoutes = require('./routes/usuarios.routes')

app.use('/api/auth', authRoutes)
app.use('/api/servicios', serviciosRoutes)
app.use('/api/barberos', barberosRoutes)
app.use('/api/citas', citasRoutes)
app.use('/api/imagenes', imagenesRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/membresias', membresiasRoutes)
//app.use('/api/usuarios', usuariosRoutes)
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')))

// ── MIDDLEWARE DE PRUEBA ──
const { verificarToken } = require('./middlewares/auth.middleware')
app.get('/api/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso permitido', usuario: req.usuario })
})



app.get('/', (req, res) => {
  res.json({
    mensaje: '💈 Bienvenido a la API de Barbería',
    version: '1.0.0',
    estado: 'funcionando',
    docs: 'http://localhost:3000/api-docs'
  })
})


const cancelarCitasPendientes = require('./jobs/cancelarCitas.job')
const { verificarMembresiasVencidas } = require('./controllers/membresias.controller')

// Ejecutar al arrancar
cancelarCitasPendientes()
verificarMembresiasVencidas()

// Ejecutar cada 30 minutos
setInterval(() => {
  cancelarCitasPendientes()
  verificarMembresiasVencidas()
}, 30 * 60 * 1000)

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(` Documentación en http://localhost:${PORT}/api-docs`)
})