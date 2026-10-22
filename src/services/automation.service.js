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

        await conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_BARBER,
            service,
        });

        const barbers = await this.getBarbers();

        return {
            success: true,
            message: `Perfecto, elegiste *${service.nombre}*. Ahora selecciona un barbero de la lista.`,
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

        await conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_DATE,
            barber,
        });

        return {
            success: true,
            message: `Perfecto, elegiste a *${barber.nombre}*. ¿Qué día quieres tu cita? Puedes escribir *mañana*, *pasado mañana* o una fecha como *12/10/2026*.`,
        };

    }

    async processSelectDate(phone, context, message) {

        const date = dateParser.parse(message);

        if (!date) {
            return {
                success: false,
                message:
                    "No reconocí esa fecha. Escribe *mañana*, *pasado mañana* o una fecha como *12/10/2026*.",
            };
        }

        if (date < dateParser.todayBogota()) {
            return {
                success: false,
                message: "Esa fecha ya pasó. Dime otra fecha futura, por ejemplo *mañana* o *12/10/2026*.",
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
                    message: `No encontré horarios disponibles con ${context.barber.nombre} ese día. Dime otra fecha, por ejemplo *mañana* o *12/10/2026*.`,
            };
        }

        await conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_TIME,
            date,
            availableSlots: slots,
        });

        return {
            success: true,
            message: `Estos son los horarios para el *${date}* con *${context.barber.nombre}*.`,
            data: slots,
        };

    }


    async processSelectTime(phone, context, message) {

        const selected = message.trim();
        const time = /^\d+$/.test(selected)
            ? context.availableSlots?.[Number(selected) - 1]
            : timeParser.parse(selected);

        if (!time) {
            return {
                success: false,
                message: "No reconocí esa hora. Responde con el número de la lista o una hora como *14:30* o *2:30 pm*.",
            };
        }

        const slotsDisponibles = context.availableSlots || [];

        if (!slotsDisponibles.includes(time)) {
            return {
                success: false,
                message: "Esa hora ya no está disponible. Elige otra de la lista.",
                data: slotsDisponibles,
            };
        }

        await conversationManager.update(phone, {
            step: CONVERSATION_STEPS.SELECT_CLIENT_NAME,
            time,
        });

        return {
            success: true,
            message: "¿A nombre de quién registro la cita? Escríbeme tu nombre y apellido.",
        };
    }

    async processSelectClientName(phone, context, message) {
        const nombre = String(message || '').trim().replace(/\s+/g, ' ');
        if (nombre.length < 2 || nombre.length > 80 || /\d/.test(nombre)) {
            return {
                success: false,
                message: "Escríbeme tu nombre y apellido (sin números), por favor.",
            };
        }

        await conversationManager.update(phone, {
            step: CONVERSATION_STEPS.CONFIRM_BOOKING,
            clientName: nombre,
        });

        return {
            success: true,
            message: `Confirma tu reserva:\n👤 ${nombre}\n📞 ${phone}\n💈 ${context.service.nombre}\n✂️ ${context.barber.nombre}\n📅 ${context.date} a las ${context.time}\n\nEscribe *CONFIRMAR* para reservar.`,
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

        if (!context.clientName) {
            await conversationManager.update(phone, {
                step: CONVERSATION_STEPS.SELECT_CLIENT_NAME,
            });
            return {
                success: false,
                message: "Antes de reservar, dime tu nombre y apellido.",
            };
        }

        const usuario = await usuariosService.obtenerOCrearDesdeWhatsApp(
            phone,
            context.clientName
        );

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
            const status = err.statusCode || err.status || 0;
            if (status >= 500 || status === 0) {
                console.error("Error temporal al crear una cita desde WhatsApp:", err);
                return {
                    success: false,
                    message: "Ocurrió un problema temporal y la cita no quedó confirmada. Escribe *CONFIRMAR* para volver a intentarlo o *CANCELAR* para empezar de nuevo.",
                };
            }

            const slots = await availabilityService.getAvailableSlots({
                barberoId: context.barber.id,
                fecha: context.date,
                servicioId: context.service.id,
            }).catch(() => []);

            if (slots.length > 0) {
                await conversationManager.update(phone, {
                    step: CONVERSATION_STEPS.SELECT_TIME,
                    availableSlots: slots,
                    time: null,
                });
                return {
                    success: false,
                    message: "No pude completar la reserva; no quedó agendada. Elige otra hora de la lista e inténtalo de nuevo.",
                    data: slots,
                };
            }

            await conversationManager.update(phone, {
                step: CONVERSATION_STEPS.SELECT_DATE,
                time: null,
                availableSlots: [],
            });
            return {
                success: false,
                message: "No pude completar la reserva; no quedó agendada. Dime otra fecha para buscar horarios.",
            };
        }

        await conversationManager.clear(phone);

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

            case CONVERSATION_STEPS.SELECT_CLIENT_NAME:
                return this.processSelectClientName(phone, context, message);

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

        const context = await conversationManager.get(phone);

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
            await conversationManager.clear(phone);
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

                await conversationManager.update(phone, {
                    step: CONVERSATION_STEPS.START,
                });

                return this.getMenu();

            case INTENTS.SERVICES:

                await conversationManager.update(phone, {
                    step: CONVERSATION_STEPS.SELECT_SERVICE,
                });
                return this.getServices();

            case INTENTS.BOOK_APPOINTMENT:

                await conversationManager.update(phone, {
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
