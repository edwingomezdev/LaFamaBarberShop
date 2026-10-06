const prisma = require("../../prisma");

class AppointmentsRepository {
    /**
     * Rango [inicio, fin) del día `fecha` (YYYY-MM-DD) en UTC puro,
     * exactamente como lo guarda citas.service.js (`new Date(fecha)`
     * sobre un string sin hora se interpreta como medianoche UTC).
     * Antes esto se calculaba con hora LOCAL del sistema operativo,
     * lo que desalineaba el rango de búsqueda varias horas según la
     * zona horaria del servidor — y hacía que citas ya agendadas
     * por la web no se vieran como "ocupadas" al calcular disponibilidad.
     */
    getRangoDelDia(fecha) {
        const [year, month, day] = fecha.split("-").map(Number);
        const inicio = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
        return { inicio, fin };
    }

    async getAppointments(barberoId, fecha) {
        const { inicio, fin } = this.getRangoDelDia(fecha);

        return prisma.cita.findMany({
            where: {
                barberoId,
                fecha: {
                    gte: inicio,
                    lt: fin,
                },
                estado: {
                    in: ["PENDIENTE", "CONFIRMADA"],
                },
            },
            include: {
                servicios: {
                    include: {
                        servicio: true,
                    },
                },
            },
            orderBy: {
                hora: "asc",
            },
        });
    }

    async existsAppointment(barberoId, fecha, hora) {
        const { inicio, fin } = this.getRangoDelDia(fecha);

        const appointment = await prisma.cita.findFirst({
            where: {
                barberoId,
                hora,
                fecha: {
                    gte: inicio,
                    lt: fin,
                },
                estado: {
                    in: ["PENDIENTE", "CONFIRMADA"],
                },
            },
        });

        return !!appointment;
    }
}

module.exports = new AppointmentsRepository();