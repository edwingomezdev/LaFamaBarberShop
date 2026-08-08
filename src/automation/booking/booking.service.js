const prisma = require("../../prisma");

class BookingService {

    async isTimeAvailable(barberId, date, time) {

        const booking = await prisma.cita.findFirst({

            where: {
                barberoId: barberId,
                fecha: new Date(`${date}T00:00:00.000Z`),
                hora: time,
                estado: {
                    not: "CANCELADA",
                },
            },

        });

        return booking === null;

    }

}

module.exports = new BookingService();