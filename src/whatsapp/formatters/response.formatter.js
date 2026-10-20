

class ResponseFormatter {

    format(response) {

        if (!response) {
            return "Ha ocurrido un error.";
        }

        const parts = [];
        if (response.message) parts.push(response.message);
        let data = response.data;
        // El inicio de reserva devuelve el resultado de getServices anidado.
        while (data && !Array.isArray(data) && data.data !== undefined) data = data.data;

        if (Array.isArray(data) && data.length === 0) {
            return [...parts, "No hay opciones disponibles en este momento. Por favor, intenta más tarde."].filter(Boolean).join("\n\n");
        }

        if (Array.isArray(data) && data.every(item => typeof item === "string")) {
            return [...parts, `🕒 *Horarios disponibles*\n\n${data.map((time, i) => `${i + 1}. ${time}`).join("\n")}\n\nResponde con el número o escribe la hora (por ejemplo, ${data[0]} o 2:30 pm).`].join("\n\n");
        }

        // Menú principal
        if (data?.options) {

            let text = "💈 *La Fama Barber*\n\n";

            text += `${data.welcome}\n\n`;

            data.options.forEach(option => {

                text += `${option.id}. ${option.label}\n`;

            });

            text += "\nEscribe el número de la opción.";

            return [...parts, text].join("\n\n");
        }

        // Listas de servicios y barberos
        if (Array.isArray(data)) {

            const isServices = data.some(item => item.precio !== undefined);
            let text = isServices ? "✂️ *Servicios disponibles*\n\n" : "💈 *Barberos disponibles*\n\n";

            data.forEach((item, index) => {

                text += `${index + 1}. ${item.nombre}`;
                if (isServices && item.precio !== undefined) text += ` — $${Number(item.precio).toLocaleString("es-CO")} COP`;
                if (isServices && item.duracion) text += ` (${item.duracion} min)`;
                text += "\n";

            });

            text += isServices
                ? "\nResponde con el número o el nombre del servicio."
                : "\nResponde con el número o el nombre del barbero.";

            return [...parts, text].join("\n\n");
        }

        if (data?.confirmationMessage) {
            const details = data;
            return [...parts, `📋 *Resumen de tu cita*\nServicio: ${details.service}\nBarbero: ${details.barber}\nFecha: ${details.date}\nHora: ${details.time}\n\n${details.confirmationMessage}`].join("\n\n");
        }

        if (data?.suggestion) parts.push(data.suggestion);

        return parts.join("\n\n") || "No hay información disponible.";
    }

}

module.exports = new ResponseFormatter();
