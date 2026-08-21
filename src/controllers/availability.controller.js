const availabilityService = require('../automation/services/availability.service')

const obtenerDisponibilidad = async (req, res, next) => {
  try {
    const { barberoId, fecha, servicioId } = req.query

    const slots = await availabilityService.getAvailableSlots({
      barberoId,
      fecha,
      servicioId,
    })

    res.json({
      barberoId: Number(barberoId),
      fecha,
      servicioId: Number(servicioId),
      slots,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  obtenerDisponibilidad,
}