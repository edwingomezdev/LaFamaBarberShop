const prisma = require("../../prisma");

class AppointmentsRepository {

    async getAppointments(barberoId, fecha) {

        const start = new Date(`${fecha}T00:00:00.000`);

        const end = new Date(`${fecha}T23:59:59.999`);

        return prisma.cita.findMany({

            where: {

                barberoId,

                fecha: {

                    gte: start,

                    lte: end,

                },

            },

            include: {

                servicios: true,

            },

        });

    }

    async existsAppointment(barberoId, fecha, hora) {

        const start = new Date(`${fecha}T00:00:00.000`);

        const end = new Date(`${fecha}T23:59:59.999`);

        const appointment = await prisma.cita.findFirst({

            where: {

                barberoId,

                hora,

                fecha: {

                    gte: start,

                    lte: end,

                },

            },

        });

        return !!appointment;

    }
}
module.exports = new AppointmentsRepository();
