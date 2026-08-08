const express = require("express");
const router = express.Router();

const automationController = require("../controllers/automation.controller");

/**
 * @swagger
 * tags:
 *   name: Automation
 *   description: Endpoints para automatizaciones
 */

/**
 * @swagger
 * /api/automation/menu:
 *   get:
 *     summary: Obtener el menú principal del asistente
 *     tags: [Automation]
 *     responses:
 *       200:
 *         description: Menú obtenido correctamente
 */
router.get("/menu", automationController.getMenu);
/**
 * @swagger
 * /api/automation/services:
 *   get:
 *     summary: Obtener todos los servicios disponibles para automatizaciones
 *     tags: [Automation]
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida correctamente
 */
router.get("/services", automationController.getServices);
/**
 * @swagger
 * /api/automation/chat:
 *   post:
 *     summary: Procesar mensajes del asistente
 *     tags: [Automation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hola
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 */
router.post("/chat", automationController.chat);

module.exports = router;