const estilosService = require('../services/estilosCorte.service')

const obtenerEstilos = async (req, res, next) => {
  try { res.json(await estilosService.listar()) } catch (err) { next(err) }
}

const obtenerEstilo = async (req, res, next) => {
  try { res.json(await estilosService.obtener(req.params.id)) } catch (err) { next(err) }
}

const crearEstilo = async (req, res, next) => {
  try { res.status(201).json(await estilosService.crear(req.body)) } catch (err) { next(err) }
}

const actualizarEstilo = async (req, res, next) => {
  try { res.json(await estilosService.actualizar(req.params.id, req.body)) } catch (err) { next(err) }
}

const eliminarEstilo = async (req, res, next) => {
  try {
    await estilosService.eliminar(req.params.id)
    res.json({ mensaje: 'Estilo de corte eliminado correctamente' })
  } catch (err) { next(err) }
}

module.exports = { obtenerEstilos, obtenerEstilo, crearEstilo, actualizarEstilo, eliminarEstilo }
