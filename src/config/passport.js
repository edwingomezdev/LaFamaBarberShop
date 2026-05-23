const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const prisma = require('../prisma')
const jwt = require('jsonwebtoken')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value
    const nombre = profile.displayName

    // Buscar si ya existe el usuario
    let usuario = await prisma.usuario.findUnique({ where: { email } })

    // Si no existe lo crea
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nombre,
          email,
          password: 'GOOGLE_AUTH',
          rol: 'CLIENTE'
        }
      })
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return done(null, { usuario, token })
  } catch (e) {
    return done(e, null)
  }
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

module.exports = passport