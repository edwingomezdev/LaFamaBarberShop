const serviciosService = require("./servicios.service");
const intentDetector = require("../automation/intents/intentDetector");
const INTENTS = require("../automation/intents/intents");
const conversationManager = require("../automation/conversation/conversation.manager");
const CONVERSATION_STEPS = require("../automation/conversation/conversationSteps");
const barberosService = require("./barberos.service");
const dateParser = require("../automation/parsers/dateParser");
const timeParser = require("../automation/parsers/timeParser");
const availabilityService = require("../automation/services/availability.service");
const usuariosService = require("./usuarios.service");
const citasService = require("./citas.service");

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

        // Selección por nombre (coincidencia parcial: "corte" encuentra
        // "Corte Clásico", no hace falta escribirlo exacto)
        const textoLower = text.toLowerCase();
        return servicios.find(servicio =>
            servicio.nombre.toLowerCase().includes(textoLower) ||
            textoLower.includes(servicio.nombre.toLowerCase())
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

        // Selección por nombre (coincidencia parcial, igual que servicios)
        const textoLower = text.toLowerCase();
        return barberos.find(barbero =>
            barbero.nombre.toLowerCase().includes(textoLower) ||
            textoLower.includes(barbero.nombre.toLowerCase())
        );

    }

    async processSelectService(phone, message) {

        const service = await this.findService(message);

        if (!service) {
            return {
                success: false,
                message:
                    "No encontré ese servicio. Escríbelo exactamente como aparece en la lista, o escribe 'cancelar' para volver al menú.",
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
                message: "No encontré ese barbero. Escríbelo exactamente como aparece en la lista, o escribe 'cancelar' para volver al menú.",
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

    async processSelectDate(phone, context, message) {

        const date = dateParser.parse(message);

        if (!date) {
            return {
                success: false,
                message:
                    "Formato de fecha inválido. Usa YYYY-MM-DD, por ejemplo: 2026-08-15.",
            };
        }

        const slots = await availabilityService.getAvailableSlots({
            barberoId: context.barber.id,
            fecha: date,
            servicioId: context.service.id,
        });

        if (slots.length === 0) {
            return {
                success: false,
                message: `No hay horarios disponibles con ${context.barber.nombre} ese día. Escribe otra fecha (YYYY-MM-DD).`,
            };
        }

        conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_TIME,
            date,
            availableSlots: slots,
        });

        console.log(
            "Contexto actualizado:",
            conversationManager.get(phone)
        );

        return {
            success: true,
            message: `Horarios disponibles para el ${date}:\n${slots.join(', ')}\n\nEscribe la hora que quieras (ej: ${slots[0]}).`,
            data: slots,
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

        const slotsDisponibles = context.availableSlots || [];

        if (!slotsDisponibles.includes(time)) {
            return {
                success: false,
                message: `Esa hora no está disponible. Elige una de estas: ${slotsDisponibles.join(', ')}.`,
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

        if (message.trim().toUpperCase() !== "CONFIRMAR") {
            return {
                success: false,
                message:
                    'Escribe CONFIRMAR para finalizar la reserva.',
            };
        }

        const usuario =
            await usuariosService.obtenerOCrearPorTelefono(phone);

        try {
            await citasService.agendar({

                usuarioId: usuario.id,

                barberoId: context.barber.id,

                servicioIds: [context.service.id],

                fecha: context.date,

                hora: context.time

            });
        } catch (err) {
            // citasService.agendar ya revalida disponibilidad real al
            // momento de crear — si alguien más tomó ese horario mientras
            // el cliente confirmaba, avisamos en vez de dejar la
            // conversación atascada.
            return {
                success: true,
                message: `No se pudo completar la reserva: ${err.message || 'ese horario ya no está disponible'}. Escribe "reservar" para intentar de nuevo.`,
            };
        }

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
                return this.processSelectDate(phone, context, message);

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

        // Palabra de escape: sin importar en qué paso esté atascada la
        // conversación, el cliente siempre puede reiniciarla. Sin esto,
        // una vez el bot entra a un flujo (ej. "elegir servicio"), no hay
        // forma de salir aunque el cliente salude o pregunte otra cosa.
        const textoNormalizado = (message || "").trim().toLowerCase();
        const esReinicio = [
            "cancelar",
            "cancela",
            "reiniciar",
            "salir",
            "menu",
            "menú",
            "empezar de nuevo",
        ].includes(textoNormalizado);

        if (esReinicio) {
            conversationManager.clear(phone);
            return this.getMenu();
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