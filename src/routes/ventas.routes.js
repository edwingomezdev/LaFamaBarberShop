const express = require('express')
const router = express.Router()
const {
  pendientesDeCobro,
  cobrar,
  venderProductos,
  cajaDelDia,
} = require('../controllers/ventas.controller')
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { cobrarSchema, venderProductosSchema } = require('../validators/ventas.validator')

// Todo este módulo es exclusivo de ADMIN y RECEPCION.
// El barbero nunca toca estas rutas: su panel sigue igual.
router.use(verificarToken, permitirRoles('ADMIN', 'RECEPCION'))

router.get('/pendientes', pendientesDeCobro)
router.get('/caja-del-dia', cajaDelDia)
router.put('/:id/cobrar', validate(cobrarSchema), cobrar)
router.post('/productos', validate(venderProductosSchema), venderProductos)

module.exports = router
