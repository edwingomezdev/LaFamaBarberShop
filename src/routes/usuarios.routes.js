const express = require('express')
const router = express.Router()
const prisma = require('../prisma')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')
const { createError } = require('../middlewares/error.middleware')

/**
 * GET /api/usuarios
 * Lista todos los clientes con su membresía activa (solo admin)
 */
router.get('/', verificarToken, soloAdmin, async (req, res, next) => {
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
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(usuarios)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/usuarios/:id
 * Detalle de un cliente (solo admin)
 */
router.get('/:id', verificarToken, soloAdmin, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        createdAt: true,
        citas: { orderBy: { fecha: 'desc' }, take: 5, include: { barbero: true, servicios: { include: { servicio: true } } } },
        membresias: { include: { membresia: true }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!usuario) return next(createError(404, 'Usuario no encontrado'))
    res.json(usuario)
  } catch (err) {
    next(err)
  }
})

module.exports = router
