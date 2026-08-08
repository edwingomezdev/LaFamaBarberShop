const servicesRepository = require("../repositories/services.repository");
const barbersRepository = require("../repositories/barbers.repository");
const conversationManager = require("../conversation/conversation.manager");
const CONVERSATION_STEPS = require("../conversation/conversationSteps");
const availabilityEngine = require("../availability/availability.engine");
const dateParser = require("../parsers/dateParser");
const bookingService = require("../services/booking.service");

class BookingFlow {


    async execute(phone, context, message) {
        console.log("BookingFlow ejecutándose...");
        switch (context.step) {

            case CONVERSATION_STEPS.SELECT_SERVICE:
                return this.selectService(phone, context, message);

            case CONVERSATION_STEPS.SELECT_BARBER:
                return this.selectBarber(phone, context, message);

            case CONVERSATION_STEPS.SELECT_DATE:
                return this.selectDate(phone, context, message);

            case CONVERSATION_STEPS.SELECT_TIME:
                return this.selectTime(phone, context, message);

            case CONVERSATION_STEPS.CONFIRM:
                return this.confirm(phone, context, message);

            default:
                return null;

        }

    }

    async selectService(phone, context, message) {

        const service = await servicesRepository.findByName(message);

        if (!service) {
            return {
                success: false,
                message: "No encontré ese servicio. Escríbelo exactamente como aparece en la lista.",
            };
        }

        conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_BARBER,
            service,
        });

        console.log(
            "Nuevo contexto:",
            conversationManager.get(phone)
        );

        return {
            success: true,
            message: `Perfecto. Has seleccionado "${service.nombre}". Ahora elige un barbero.`,
        };

    }

    async selectBarber(phone, context, message) {

        const barber =
            await barbersRepository.findByName(message);

        if (!barber) {

            return {
                success: false,
                message:
                    "No encontré ese barbero. Escríbelo exactamente como aparece en la lista.",
            };

        }

        conversationManager.update(phone, {

            step: CONVERSATION_STEPS.SELECT_DATE,

            barber,

        });

        console.log(
            "Nuevo contexto:",
            conversationManager.get(phone)
        );

        return {

            success: true,

            message:
                `Excelente. Reservarás con ${barber.nombre}. Ahora escribe la fecha (AAAA-MM-DD).`

        };

    }
    async selectDate(phone, context, message) {

        const date = dateParser.parse(message);

        if (!date) {

            return {
                success: false,
                message: "La fecha no es válida.",
            };

        }

        conversationManager.update(phone, {

            step: CONVERSATION_STEPS.SELECT_TIME,

            date,

        });

        console.log(
            "Fecha seleccionada:",
            conversationManager.get(phone)
        );

        const slots =
            await availabilityEngine.getAvailableSlots(

                context.barber.id,

                date,

                context.service.duracion

            );

        return {

            success: true,

            message: "Horarios disponibles.",

            data: slots

        };

    }

    async selectTime(phone, context, message) {

        conversationManager.update(phone, {

            step: CONVERSATION_STEPS.CONFIRM,

            time: message.trim()

        });

        console.log(
            "Hora seleccionada:",
            conversationManager.get(phone)
        );

        return {

            success: true,

            message:
                `Has seleccionado las ${message}. Escribe "confirmar" para crear la reserva.`

        };

    }

    async confirm(phone, context, message) {

        if (message.trim().toLowerCase() !== "confirmar") {

            return {

                success: false,

                message:
                    'Escribe "confirmar" para finalizar la reserva.'

            };

        }

        await bookingService.createAppointment({

            service: context.service,

            barber: context.barber,

            date: context.date,

            time: context.time

        });

        conversationManager.clear(phone);

        return {

            success: true,

            message:
                "✅ Tu reserva ha sido registrada correctamente."

        };

    }

}

module.exports = new BookingFlow();