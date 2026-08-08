

class ResponseFormatter {

    format(response) {

        if (!response) {
            return "Ha ocurrido un error.";
        }

        // Si el servicio ya devuelve un mensaje simple
        if (response.message && !response.data) {
            return response.message;
        }

        // Menú principal
        if (response.data?.options) {

            let text = "";

            text += "💈 *La Fama Barber*\n\n";

            text += `${response.data.welcome}\n\n`;

            response.data.options.forEach(option => {

                text += `${option.id}. ${option.label}\n`;

            });

            text += "\nEscribe el número de la opción.";

            return text;
        }

        // Lista de servicios
        if (Array.isArray(response.data)) {

            let text = "✂️ *Servicios disponibles*\n\n";

            response.data.forEach((service, index) => {

                text += `${index + 1}. ${service.nombre}\n`;

            });

           text += "\nResponde con el número o con el nombre del servicio.";

            return text;
        }

        return response.message || "No hay información disponible.";
    }

}

module.exports = new ResponseFormatter();