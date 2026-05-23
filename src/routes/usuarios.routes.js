const express = require('express')
const router = express.Router()
const prisma = require('../prisma')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, soloAdmin, async (req, res) => {
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

module.exports = router