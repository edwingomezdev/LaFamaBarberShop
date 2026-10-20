const axios = require("axios");
const metaConfig = require("../../config/meta.config");

class WhatsAppService {

    async sendTextMessage(to, message) {

        const url =
            `https://graph.facebook.com/${metaConfig.graphApiVersion}/${metaConfig.phoneNumberId}/messages`;

        try {

            const body = {

                messaging_product: "whatsapp",

                to,

                type: "text",

                text: {
                    body: message
                }

            };

            const headers = {

                Authorization: `Bearer ${metaConfig.accessToken}`,

                "Content-Type": "application/json"

            };
            const response =
                await axios.post(

                    url,

                    body,

                    { headers }

                );

            return response.data;

        } catch (error) {

            console.error("No se pudo enviar la respuesta de WhatsApp:", error.response?.data || error.message);
            throw error;

        }
    }

}

module.exports = new WhatsAppService();
