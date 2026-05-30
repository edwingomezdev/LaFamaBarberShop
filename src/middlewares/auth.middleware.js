const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
  // El token llega en el header así:
  // Authorization: Bearer eyJhbGci...
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded // guardamos los datos del usuario en la petición
    next() // dejamos pasar
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

const verificarBarberoToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token de barbero requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.tipo !== 'BARBERO' || !decoded.barberoId) {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere sesion de barbero' })
    }
    req.barbero = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token de barbero invalido o expirado' })
  }
}

const verificarTokenFlexible = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded.rol ? decoded : null
    req.barbero = decoded.tipo === 'BARBERO' ? decoded : null
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token invalido o expirado' })
  }
}

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN' })
  }
  next()
}

const soloAdminOBarbero = (req, res, next) => {
  if (req.usuario?.rol === 'ADMIN' || req.barbero?.tipo === 'BARBERO') return next()
  return res.status(403).json({ error: 'Acceso denegado' })
}

module.exports = { verificarToken, verificarBarberoToken, verificarTokenFlexible, soloAdmin, soloAdminOBarbero }
