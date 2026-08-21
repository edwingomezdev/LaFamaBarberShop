const availabilityEngine = require("../availability/availability.engine");
const servicesRepository = require("../repositories/services.repository");

class AvailabilityService {
    async getAvailableSlots({ barberoId, fecha, servicioId }) {
        const servicio = await servicesRepository.findById(servicioId);

        return availabilityEngine.getAvailableSlots(
            Number(barberoId),
            fecha,
            Number(servicio.duracion)
        );
    }
}

module.exports = new AvailabilityService();