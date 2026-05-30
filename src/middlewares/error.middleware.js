const logger = require('../config/logger')

/**
 * Middleware de manejo de errores centralizado.
 * Debe registrarse DESPUÉS de todas las rutas en index.js.
 *
 * Uso desde un controller:
 *   next(error)          — error genérico → 500
 *   next(createError(404, 'No encontrado')) — con statusCode
 */
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500
  const message = err.message || 'Error interno del servidor'

  logger.error(
    { err, method: req.method, url: req.url, status },
    message
  )

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

/**
 * Crea un error con statusCode para pasar a next().
 * Ejemplo: next(createError(404, 'Cita no encontrada'))
 */
const createError = (statusCode, message) => {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

module.exports = { errorHandler, createError }
