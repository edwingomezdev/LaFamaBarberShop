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
            console.log("========== ENVIANDO ==========");
            console.log(url);

            console.log(body);

            console.log(headers.Authorization.substring(0, 30) + "...");
            console.log("==============================");

            const response =
                await axios.post(

                    url,

                    body,

                    { headers }

                );

            console.log("✅ Mensaje enviado");

            return response.data;

        } catch (error) {

            console.log("========== ERROR ENVIANDO A META ==========");
            console.log("URL:", url);
            console.log("Destino:", to);
            console.log("Phone Number ID:", metaConfig.phoneNumberId);
            console.log("Mensaje de error:", error.message);
            console.log("Respuesta de Meta:", JSON.stringify(error.response?.data, null, 2));
            console.log("============================================");

            return null;

        }
    }

}

module.exports = new WhatsAppService();