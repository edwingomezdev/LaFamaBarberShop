const express = require('express')
const router = express.Router()
const { registro, crearPersonal, login } = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { registroSchema, personalSchema, loginSchema } = require('../validators/auth.validator')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');
const prisma = require('../prisma')

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan García
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               telefono:
 *                 type: string
 *                 example: "300 123 4567"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Email ya registrado o datos inválidos
 */
router.post('/registro', validate(registroSchema), registro)
router.post('/personal', verificarToken, soloAdmin, validate(personalSchema), crearPersonal)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validate(loginSchema), login)

module.exports = router


const passport = require('../config/passport')

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=true` }),
  (req, res) => {
    const { token, usuario } = req.user
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}&usuario=${encodeURIComponent(JSON.stringify(usuario))}`)
  }
)

// GET /api/usuarios — solo admin
router.get('/usuarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { rol: 'CLIENTE' },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        createdAt: true,
        membresias: {
          where: { estado: 'ACTIVA' },
          include: { membresia: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(usuarios)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Cuentas internas para los paneles de recepción e inventario.
router.get('/personal', verificarToken, soloAdmin, async (req, res) => {
  try {
    const personal = await prisma.usuario.findMany({
      where: { rol: { in: ['RECEPCION', 'PRODUCTOS'] } },
      select: { id: true, nombre: true, email: true, telefono: true, rol: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(personal)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Editar una cuenta de personal existente (nombre/email/teléfono/rol,
// y opcionalmente la contraseña si se quiere resetear).
router.put('/personal/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, email, telefono, rol, password } = req.body

    if (rol && !['RECEPCION', 'PRODUCTOS'].includes(rol)) {
      return res.status(400).json({ error: "El rol debe ser 'RECEPCION' o 'PRODUCTOS'" })
    }

    const data = { nombre, email, telefono, rol }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
      }
      const bcrypt = require('bcryptjs')
      data.password = await bcrypt.hash(password, 10)
    }

    const actualizado = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, nombre: true, email: true, telefono: true, rol: true, createdAt: true },
    })
    res.json(actualizado)
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Ese email ya está en uso' })
    }
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Eliminar una cuenta de personal. Si tiene ventas cobradas asociadas,
// Prisma bloquea el borrado por integridad referencial — en ese caso
// avisamos en vez de dejar caer un error genérico.
router.delete('/personal/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    await prisma.usuario.delete({ where: { id: Number(req.params.id) } })
    res.json({ mensaje: 'Cuenta eliminada' })
  } catch (e) {
    if (e.code === 'P2003') {
      return res.status(400).json({ error: 'Esta cuenta ya registró ventas/cobros y no se puede eliminar. Puedes editarla para desactivarla en su lugar.' })
    }
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})
