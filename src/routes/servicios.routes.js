const express = require('express')
const router = express.Router()
const {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} = require('../controllers/servicios.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { servicioSchema } = require('../validators/servicios.validator')

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     summary: Obtener todos los servicios
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
router.get('/', obtenerServicios)

/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', obtenerServicio)

/**
 * @swagger
 * /api/servicios:
 *   post:
 *     summary: Crear un servicio (solo admin)
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, precio, duracion]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Corte Clásico
 *               descripcion:
 *                 type: string
 *                 example: Tijera y máquina
 *               precio:
 *                 type: number
 *                 example: 35000
 *               duracion:
 *                 type: integer
 *                 example: 45
 *     responses:
 *       201:
 *         description: Servicio creado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, soloAdmin, validate(servicioSchema), crearServicio)
router.put('/:id', verificarToken, soloAdmin, actualizarServicio)
router.delete('/:id', verificarToken, soloAdmin, eliminarServicio)

module.exports = router