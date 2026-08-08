const axios = require("axios");
const metaConfig = require("../../config/meta.config");

class WhatsAppService {

    async sendTextMessage(to, message) {

        try {

            const url =
                `https://graph.facebook.com/${metaConfig.graphApiVersion}/${metaConfig.phoneNumberId}/messages`;

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

            console.log("========== ENVÍO A META ==========");
            console.log("URL:", url);
            console.log("Destino:", to);
            console.log("Token:", metaConfig.accessToken?.substring(0, 20) + "...");
            console.log("Phone Number ID:", metaConfig.phoneNumberId);
            console.log("==================================");

        }
    }

}

module.exports = new WhatsAppService();