const metaConfig = require("../../config/meta.config");
const whatsappService = require("../services/whatsapp.service");
const automationService = require("../../services/automation.service");

class WhatsAppController {

    async verify(req, res) {

        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (
            mode === "subscribe" &&
            token === metaConfig.verifyToken
        ) {
            console.log("✅ Webhook verificado");
            return res.status(200).send(challenge);
        }

        return res.sendStatus(403);

    }

    async receive(req, res) {

        try {

            console.log("================================");
            console.log("📩 WEBHOOK RECIBIDO");
            console.log(JSON.stringify(req.body, null, 2));
            console.log("================================");

            const message =
                req.body?.entry?.[0]
                    ?.changes?.[0]
                    ?.value?.messages?.[0];

            if (!message) {
                return res.sendStatus(200);
            }

            if (message.type !== "text") {
                console.log("Mensaje ignorado:", message.type);
                return res.sendStatus(200);
            }

            const phone = message.from;
            const text = message.text?.body?.trim() || "";

            console.log("📱", phone);
            console.log("💬", text);

            const response =
                await automationService.chat({
                    phone,
                    message: text
                });

            console.log("========= RESPUESTA =========");
            console.log(response);
            console.log("=============================");

            if (!response?.success) {
                return res.sendStatus(200);
            }

            if (response.message) {

                await whatsappService.sendTextMessage(
                    phone,
                    response.message
                );

            }

            return res.sendStatus(200);

        } catch (error) {

            console.error(error);

            return res.sendStatus(500);

        }

    }

}

module.exports = new WhatsAppController();