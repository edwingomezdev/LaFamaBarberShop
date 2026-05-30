const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')
const env = require('../config/env')

// Mapa de intentos fallidos por IP (en memoria — suficiente para MVP)
const loginAttempts = new Map()
const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

const registro = async ({ nombre, email, password, telefono }) => {
  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) throw createError(400, 'El email ya está registrado')

  const passwordHash = await bcrypt.hash(password, 10)
  const usuario = await prisma.usuario.create({
    data: { nombre, email, password: passwordHash, telefono },
  })

  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
}

const login = async ({ email, password, ip }) => {
  // Verificar bloqueo
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: null }
  if (attempts.count >= MAX_ATTEMPTS) {
    const minutos = (Date.now() - attempts.lastAttempt) / 60000
    if (minutos < LOCK_MINUTES) {
      const restantes = Math.ceil(LOCK_MINUTES - minutos)
      throw createError(429, `Demasiados intentos. Intenta en ${restantes} minuto(s)`)
    }
    loginAttempts.delete(ip)
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  const passwordValida = usuario && await bcrypt.compare(password, usuario.password)

  if (!usuario || !passwordValida) {
    const prev = loginAttempts.get(ip) || { count: 0 }
    loginAttempts.set(ip, { count: prev.count + 1, lastAttempt: Date.now() })
    throw createError(401, 'Credenciales incorrectas')
  }

  loginAttempts.delete(ip)

  const expiresIn = usuario.rol === 'ADMIN' ? '24h' : '7d'
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    env.JWT_SECRET,
    { expiresIn }
  )

  return {
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  }
}

module.exports = { registro, login }
