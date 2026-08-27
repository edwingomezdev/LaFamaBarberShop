const appointmentsRepository = require("../repositories/appointments.repository");
const timeHelper = require("../helpers/time.helper");

class AvailabilityEngine {

    calculateAppointmentDuration(appointment) {
        return appointment.servicios.reduce(
            (total, citaServicio) => {
                return total + Number(
                    citaServicio.servicio?.duracion || 0
                );
            },
            0
        );
    }

    getOccupiedIntervals(appointments) {
        return appointments
            .map((appointment) => {
                const start = timeHelper.toMinutes(
                    appointment.hora
                );

                const duration =
                    this.calculateAppointmentDuration(
                        appointment
                    );

                return {
                    start,
                    end: start + duration,
                    appointmentId: appointment.id,
                };
            })
            .filter(
                (interval) =>
                    interval.end > interval.start
            );
    }

    hasOverlap(
        requestedStart,
        requestedEnd,
        occupiedStart,
        occupiedEnd
    ) {
        return (
            requestedStart < occupiedEnd &&
            requestedEnd > occupiedStart
        );
    }

    isSlotAvailable(
        start,
        duration,
        occupiedIntervals
    ) {
        const end = start + duration;

        return !occupiedIntervals.some(
            (interval) =>
                this.hasOverlap(
                    start,
                    end,
                    interval.start,
                    interval.end
                )
        );
    }

    async getAvailableSlots(
        barberoId,
        fecha,
        duracion
    ) {
        const appointments =
            await appointmentsRepository.getAppointments(
                barberoId,
                fecha
            );

        console.log(
            "Citas encontradas:",
            appointments.length
        );

        console.log(
            "Duración del servicio solicitado:",
            duracion
        );

        const occupiedIntervals =
            this.getOccupiedIntervals(
                appointments
            );

        console.log(
            "Intervalos ocupados:",
            occupiedIntervals
        );

        const slots = [];

        const start =
            timeHelper.toMinutes("09:00");

        const end =
            timeHelper.toMinutes("21:00");

               const ahoraBogota = new Date(Date.now() - 5 * 60 * 60 * 1000);
        const fechaSolicitada = new Date(fecha);
        const esHoy =
            ahoraBogota.getUTCFullYear() === fechaSolicitada.getUTCFullYear() &&
            ahoraBogota.getUTCMonth() === fechaSolicitada.getUTCMonth() &&
            ahoraBogota.getUTCDate() === fechaSolicitada.getUTCDate();
        const minutosAhora = esHoy
            ? ahoraBogota.getUTCHours() * 60 + ahoraBogota.getUTCMinutes()
            : -1;

        let current = start;

        while (current + duracion <= end) {

            if (
                current > minutosAhora &&
                this.isSlotAvailable(
                    current,
                    duracion,
                    occupiedIntervals
                )
            ) {
                slots.push(
                    timeHelper.toTime(current)
                );
            }

            current += duracion;
        }

        

        while (current + duracion <= end) {

            if (
                this.isSlotAvailable(
                    current,
                    duracion,
                    occupiedIntervals
                )
            ) {
                slots.push(
                    timeHelper.toTime(current)
                );
            }

            current += duracion;
        }

        return slots;
    }
}

module.exports = new AvailabilityEngine();