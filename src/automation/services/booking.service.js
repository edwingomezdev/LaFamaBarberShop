const prisma = require("../../prisma");
const appointmentsRepository = require("../repositories/appointments.repository");
const { createError } = require("../../middlewares/error.middleware");


class BookingService {

    async createAppointment(data) {

        const exists =
            await appointmentsRepository.existsAppointment(

                data.barber.id,

                data.date,

                data.time

            );

        if (exists) {

            throw createError(
                409,
                "Ese horario ya fue reservado. Por favor selecciona otro horario."
            );
        }

        const appointment = await prisma.$transaction(async (tx) => {

            const cita = await tx.cita.create({

                data: {

                    fecha: new Date(`${data.date}T00:00:00`),

                    hora: data.time,

                    estado: "PENDIENTE",

                    usuarioId: 1,

                    barberoId: data.barber.id,

                }

            });

            await tx.citaServicio.create({

                data: {

                    citaId: cita.id,

                    servicioId: data.service.id,

                }

            });

            return cita;

        });

        return appointment;

    }

}

module.exports = new BookingService();