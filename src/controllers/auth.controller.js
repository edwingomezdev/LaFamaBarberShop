const authService = require('../services/auth.service')

const registro = async (req, res, next) => {
  try {
    const usuario = await authService.registro(req.body)
    res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress
    const result = await authService.login({ ...req.body, ip })
    res.json({ mensaje: 'Login exitoso', ...result })
  } catch (err) {
    next(err)
  }
}

module.exports = { registro, login }
