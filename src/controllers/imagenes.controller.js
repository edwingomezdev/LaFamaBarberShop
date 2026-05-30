const imagenesService = require('../services/imagenes.service')

const obtenerCarrusel = async (req, res, next) => {
  try { res.json(await imagenesService.listarCarrusel()) } catch (err) { next(err) }
}

const crearImagenCarrusel = async (req, res, next) => {
  try {
    res.status(201).json(await imagenesService.crearImagen({ ...req.body, file: req.file }))
  } catch (err) { next(err) }
}

const actualizarImagenCarrusel = async (req, res, next) => {
  try { res.json(await imagenesService.actualizarImagen(req.params.id, req.body)) } catch (err) { next(err) }
}

const eliminarImagenCarrusel = async (req, res, next) => {
  try {
    await imagenesService.eliminarImagen(req.params.id)
    res.json({ mensaje: 'Imagen eliminada' })
  } catch (err) { next(err) }
}

const actualizarImagenServicio = async (req, res, next) => {
  try {
    res.json(await imagenesService.actualizarImagenServicio(req.params.id, { ...req.body, file: req.file }))
  } catch (err) { next(err) }
}

const actualizarImagenEstiloCorte = async (req, res, next) => {
  try {
    res.json(await imagenesService.actualizarImagenEstiloCorte(req.params.id, { ...req.body, file: req.file }))
  } catch (err) { next(err) }
}

module.exports = {
  obtenerCarrusel,
  crearImagenCarrusel,
  actualizarImagenCarrusel,
  eliminarImagenCarrusel,
  actualizarImagenServicio,
  actualizarImagenEstiloCorte,
}
