const appointmentsRepository = require("../repositories/appointments.repository");
const timeHelper = require("../helpers/time.helper");

class AvailabilityEngine {

    async getAvailableSlots(barberoId, fecha, duracion) {

        const appointments =
            await appointmentsRepository.getAppointments(
                barberoId,
                fecha
            );
        const occupied = appointments.map(appointment => appointment.hora);

        console.log("Citas encontradas:", appointments.length);
        console.log("Duración del servicio:", duracion);
        console.log("Horas ocupadas:", occupied);
        const slots = [];

        let current =
            timeHelper.toMinutes("09:00");

        const end =
            timeHelper.toMinutes("21:00");

        while (current + duracion <= end) {

            const hour =
                timeHelper.toTime(current);

            if (!occupied.includes(hour)) {

                slots.push(hour);

            }

            current += duracion;

        }

        return slots;

    }

}

module.exports = new AvailabilityEngine();