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

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN' })
  }
  next()
}

module.exports = { verificarToken, soloAdmin }