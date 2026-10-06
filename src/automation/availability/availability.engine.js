const appointmentsRepository = require("../repositories/appointments.repository");
const timeHelper = require("../helpers/time.helper");
const prisma = require("../../prisma");

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
        // Si el barbero tiene marcado ese día como descanso
        // (vacaciones, incapacidad, etc.), no hay ningún horario
        // disponible — ni para la web ni para el bot de WhatsApp,
        // ya que ambos pasan por este mismo motor.
        const { inicio, fin } = appointmentsRepository.getRangoDelDia(fecha);
        const descanso = await prisma.diaDescanso.findFirst({
            where: { barberoId, fecha: { gte: inicio, lt: fin } },
        });
        if (descanso) {
            console.log("Barbero de descanso ese día, sin horarios disponibles");
            return [];
        }

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

        return slots;
    }
}

module.exports = new AvailabilityEngine();