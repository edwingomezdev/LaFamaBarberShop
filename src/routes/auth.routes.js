const express = require('express')
const router = express.Router()
const { registro, login } = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { registroSchema, loginSchema } = require('../validators/auth.validator')
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