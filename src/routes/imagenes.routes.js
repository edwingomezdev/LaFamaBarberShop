const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')
const {
  obtenerCarrusel,
  crearImagenCarrusel,
  actualizarImagenCarrusel,
  eliminarImagenCarrusel,
  actualizarImagenServicio
} = require('../controllers/imagenes.controller')

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `img-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    const valid = allowed.test(path.extname(file.originalname).toLowerCase())
    valid ? cb(null, true) : cb(new Error('Solo imágenes JPG, PNG o WEBP'))
  }
})

// Carrusel
router.get('/carrusel', obtenerCarrusel)
router.post('/carrusel', verificarToken, soloAdmin, upload.single('imagen'), crearImagenCarrusel)
router.put('/carrusel/:id', verificarToken, soloAdmin, actualizarImagenCarrusel)
router.delete('/carrusel/:id', verificarToken, soloAdmin, eliminarImagenCarrusel)

// Servicios
router.put('/servicios/:id', verificarToken, soloAdmin, upload.single('imagen'), actualizarImagenServicio)

// Foto barbero
router.put('/barberos/:id', verificarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { url } = req.body
    let fotoUrl = url
    if (req.file) {
      fotoUrl = `/uploads/${req.file.filename}`
    }
    const barbero = await require('../prisma').barbero.update({
      where: { id: Number(req.params.id) },
      data: { foto: fotoUrl }
    })
    res.json(barbero)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
})

module.exports = router