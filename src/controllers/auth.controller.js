const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

// ── REGISTRO ──
const registro = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body

    // Verificar si el email ya existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExiste) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear el usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        telefono
      }
    })

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    })

 } catch (error) {
  console.error(error)
  res.status(500).json({ error: 'Error interno del servidor' })
}
}


//AQUI EMPIEZA EL MODULO DEL LOGIN
// ── LOGIN ──
// Mapa para rastrear intentos fallidos
const loginAttempts = new Map()

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const ip = req.ip || req.connection.remoteAddress

    // Verificar si está bloqueado
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: null }
    if (attempts.count >= 5) {
      const minutosBloqueo = 15
      const tiempoTranscurrido = (Date.now() - attempts.lastAttempt) / 1000 / 60
      if (tiempoTranscurrido < minutosBloqueo) {
        const minutosRestantes = Math.ceil(minutosBloqueo - tiempoTranscurrido)
        return res.status(429).json({
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutosRestantes} minuto(s)`
        })
      } else {
        loginAttempts.delete(ip)
      }
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      loginAttempts.set(ip, { count: (attempts.count || 0) + 1, lastAttempt: Date.now() })
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password)
    if (!passwordValida) {
      loginAttempts.set(ip, { count: (attempts.count || 0) + 1, lastAttempt: Date.now() })
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Login exitoso — limpiar intentos
    loginAttempts.delete(ip)

    // Token más corto para admin
    const expiresIn = usuario.rol === 'ADMIN' ? '24h' : '7d'

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn }
    )

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
module.exports = { registro, login }