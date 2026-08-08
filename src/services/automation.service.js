const serviciosService = require("./servicios.service");
const intentDetector = require("../automation/intents/intentDetector");
const INTENTS = require("../automation/intents/intents");
const conversationManager = require("../automation/conversation/conversation.manager");
const CONVERSATION_STEPS = require("../automation/conversation/conversationSteps");
const barberosService = require("./barberos.service");
const dateParser = require("../automation/parsers/dateParser");
const timeParser = require("../automation/parsers/timeParser");
const bookingService = require("../automation/booking/booking.service");
const bookingFlow = require("../automation/flows/booking.flow");

class AutomationService {
    async getMenu() {
        return {
            success: true,
            data: {
                title: "💈 La Fama Barber",
                welcome: "¡Bienvenido! ¿En qué podemos ayudarte?",
                options: [
                    {
                        id: 1,
                        key: "BOOK_APPOINTMENT",
                        label: "Reservar cita",
                    },
                    {
                        id: 2,
                        key: "SERVICES",
                        label: "Ver servicios",
                    },
                    {
                        id: 3,
                        key: "PROMOTIONS",
                        label: "Promociones",
                    },
                    {
                        id: 4,
                        key: "HUMAN_SUPPORT",
                        label: "Hablar con un asesor",
                    },
                ],
            },
        };
    }

    async getServices() {

        const servicios = await serviciosService.listar();

        return {
            success: true,
            data: servicios,
        };

    }

    async getBarbers() {

        const barberos = await barberosService.listar();

        return {
            success: true,
            data: barberos,
        };

    }

    async findService(message) {

        const servicios = await serviciosService.listar();

        const text = message.trim();

        // Selección por número
        if (/^\d+$/.test(text)) {

            const index = Number(text) - 1;

            if (index >= 0 && index < servicios.length) {
                return servicios[index];
            }

        }

        // Selección por nombre
        return servicios.find(servicio =>
            servicio.nombre.toLowerCase() === text.toLowerCase()
        );

    }

    async findBarber(message) {

        const barberos = await barberosService.listar();

        const text = message.trim();

        // Selección por número
        if (/^\d+$/.test(text)) {

            const index = Number(text) - 1;

            if (index >= 0 && index < barberos.length) {
                return barberos[index];
            }

        }

        // Selección por nombre
        return barberos.find(barbero =>
            barbero.nombre.toLowerCase() === text.toLowerCase()
        );

    }

    async processSelectService(phone, message) {

        const service = await this.findService(message);

        if (!service) {
            return {
                success: false,
                message:
                    "No encontré ese servicio. Escríbelo exactamente como aparece en la lista.",
            };
        }

        conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_BARBER,
            service,
        });

        console.log(
            "Contexto actualizado:",
            conversationManager.get(phone)
        );

        const barbers = await this.getBarbers();

        return {
            success: true,
            message: `Perfecto. Has seleccionado "${service.nombre}". Ahora elige un barbero.`,
            data: barbers,
        };

    }


    async processSelectBarber(phone, message) {

        const barber = await this.findBarber(message);

        if (!barber) {
            return {
                success: false,
                message: "No encontré ese barbero. Escríbelo exactamente como aparece en la lista.",
            };
        }

        conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_DATE,
            barber,
        });

        console.log(
            "Contexto actualizado:",
            conversationManager.get(phone)
        );

        return {
            success: true,
            message: `Perfecto. Has elegido a ${barber.nombre}. Ahora dime la fecha en la que deseas tu cita.`,
        };

    }

    async processSelectDate(phone, message) {

        const date = dateParser.parse(message);

        if (!date) {
            return {
                success: false,
                message:
                    "Formato de fecha inválido. Usa YYYY-MM-DD, por ejemplo: 2026-08-15.",
            };
        }

        conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_TIME,
            date,
        });

        console.log(
            "Contexto actualizado:",
            conversationManager.get(phone)
        );

        return {
            success: true,
            message: `Perfecto. Reservaremos para el día ${date}. Ahora escribe la hora que deseas (por ejemplo: 14:30).`,
        };

    }


    async processSelectTime(phone, context, message) {

        const time = timeParser.parse(message);

        if (!time) {
            return {
                success: false,
                message:
                    "Hora inválida. Usa el formato HH:mm. Ejemplo: 14:30.",
            };
        }

        conversationManager.update(phone, {
            step: CONVERSATION_STEPS.CONFIRM_BOOKING,
            time,
        });

        console.log(
            "Contexto actualizado:",
            conversationManager.get(phone)
        );

        return {
            success: true,
            message: "Confirma tu reserva.",
            data: {
                service: context.service.nombre,
                barber: context.barber.nombre,
                date: context.date,
                time,
                confirmationMessage:
                    "Escribe CONFIRMAR para finalizar la reserva."
            }
        };
    }

    async processConfirmation(phone, context, message) {

        const available = await bookingService.isTimeAvailable(
            context.barber.id,
            context.date,
            context.time
        );

        if (!available) {

            return {
                success: false,
                message:
                    "Ese horario ya no está disponible. Elige otra hora.",
            };

        }

        if (message.trim().toUpperCase() !== "CONFIRMAR") {
            return {
                success: false,
                message:
                    "Escribe CONFIRMAR para finalizar la reserva.",
            };
        }

        const usuario =
            await usuariosService.obtenerOCrearPorTelefono(phone);

        await citasService.agendar({

            usuarioId: usuario.id,

            barberoId: context.barber.id,

            servicioIds: [context.service.id],

            fecha: context.date,

            hora: context.time

        });

        conversationManager.clear(phone);

        return {

            success: true,

            message:
                "✅ Tu cita fue reservada exitosamente. ¡Te esperamos en La Fama Barber! 💈"

        };
    }


    async continueConversation(phone, context, message) {

        switch (context.step) {

            case CONVERSATION_STEPS.SELECT_SERVICE:
                return this.processSelectService(phone, message);

            case CONVERSATION_STEPS.SELECT_BARBER:
                return this.processSelectBarber(phone, message);

            case CONVERSATION_STEPS.SELECT_DATE:
                return this.processSelectDate(phone, message);

            case CONVERSATION_STEPS.SELECT_TIME:
                return this.processSelectTime(phone, context, message);

            case CONVERSATION_STEPS.CONFIRM_BOOKING:
                return this.processConfirmation(
                    phone,
                    context,
                    message
                );


            default:
                return null;

        }

    }

    async chat({ phone, message }) {

        const context = conversationManager.get(phone);

        console.log(
            "Conversación:",
            phone,
            context
        );
        console.log("Contexto al iniciar chat:", context);

        const bookingResponse =
            await bookingFlow.execute(
                phone,
                context,
                message
            );

        if (bookingResponse) {
            return bookingResponse;
        }

        const activeConversation = await this.continueConversation(
            phone,
            context,
            message
        );

        if (activeConversation) {
            return activeConversation;
        }

        const intent = intentDetector.detect(message);



        switch (intent) {

            case INTENTS.GREETING:

                conversationManager.update(phone, {
                    step: CONVERSATION_STEPS.START,
                });

                return this.getMenu();

            case INTENTS.SERVICES:

                conversationManager.update(phone, {
                    step: CONVERSATION_STEPS.SELECT_SERVICE,
                });
                console.log(
                    "Estado:",
                    conversationManager.get(phone)
                );
                return this.getServices();

            case INTENTS.BOOK_APPOINTMENT:

                conversationManager.update(phone, {
                    step: CONVERSATION_STEPS.SELECT_SERVICE,
                });

                return {
                    success: true,
                    message: "Perfecto, empecemos con tu reserva.",
                    data: await this.getServices(),
                };

            default:
                return {
                    success: true,
                    message: "No entendí tu solicitud.",
                    data: {
                        intent,
                        suggestion: "Puedes escribir 'hola' o 'servicios'."
                    }
                };

        }

    }
}
module.exports = new AutomationService();