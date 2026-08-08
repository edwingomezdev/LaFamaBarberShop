const INTENTS = require("./intents");

class IntentDetector {
    detect(message = "") {
        const text = message.trim().toLowerCase();

        // Saludos
        if (
            text.includes("hola") ||
            text.includes("buenas") ||
            text.includes("buen día") ||
            text.includes("buenos días") ||
            text.includes("buenas tardes") ||
            text.includes("buenas noches") ||
            text.includes("hey")
        ) {
            return INTENTS.GREETING;
        }

        // Servicios
        // Consultar servicios
        if (
            text.includes("servicio") ||
            text.includes("servicios") ||
            text.includes("precio") ||
            text.includes("precios") ||
            text.includes("cuánto cuesta") ||
            text.includes("valor")
        ) {
            return INTENTS.SERVICES;
        }

        // Reservar cita
        if (
            text.includes("reservar") ||
            text.includes("reserva") ||
            text.includes("agendar") ||
            text.includes("agenda") ||
            text.includes("cita") ||
            text.includes("quiero un corte") ||
            text.includes("quiero cortarme") ||
            text.includes("necesito un corte")
        ) {
            return INTENTS.BOOK_APPOINTMENT;
        }

        return INTENTS.UNKNOWN;
    }
}

module.exports = new IntentDetector();