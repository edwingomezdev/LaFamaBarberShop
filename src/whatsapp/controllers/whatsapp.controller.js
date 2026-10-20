const metaConfig = require("../../config/meta.config");
const whatsappService = require("../services/whatsapp.service");
const automationService = require("../../services/automation.service");
const responseFormatter = require("../formatters/response.formatter");
const crypto = require("crypto");

const recentMessages = new Map();
const MESSAGE_DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;

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

        let messageId;
        try {

            // Meta signs the exact raw JSON body with the app secret.
            if (!metaConfig.appSecret || !req.rawBody) {
                console.error("META_APP_SECRET no está configurado para validar el webhook.");
                return res.sendStatus(503);
            }

            const signature = req.get("x-hub-signature-256") || "";
            const signatureHex = signature.startsWith("sha256=") ? signature.slice(7) : "";
            const receivedSignature = Buffer.from(signatureHex, "hex");
            const expectedSignature = crypto
                .createHmac("sha256", metaConfig.appSecret)
                .update(req.rawBody)
                .digest();

            if (
                receivedSignature.length !== expectedSignature.length ||
                !crypto.timingSafeEqual(receivedSignature, expectedSignature)
            ) {
                return res.sendStatus(401);
            }

            const messages = (req.body?.entry || [])
                .flatMap(entry => entry.changes || [])
                .flatMap(change => change.value?.messages || []);

            if (messages.length === 0) return res.sendStatus(200);

            const now = Date.now();
            for (const [id, expiresAt] of recentMessages) {
                if (expiresAt <= now) recentMessages.delete(id);
            }

            for (const message of messages) {
                messageId = message.id;
                if (messageId && recentMessages.has(messageId)) continue;
                if (messageId) recentMessages.set(messageId, now + MESSAGE_DEDUPE_TTL_MS);

                if (message.type !== "text") {
                    console.log("Mensaje ignorado:", message.type);
                    continue;
                }

                const response = await automationService.chat({
                    phone: message.from,
                    message: message.text?.body?.trim() || "",
                });

                const reply = responseFormatter.format(response);
                if (reply) await whatsappService.sendTextMessage(message.from, reply);
            }

            return res.sendStatus(200);

        } catch (error) {

            if (messageId) recentMessages.delete(messageId);
            console.error(error);

            return res.sendStatus(500);

        }

    }

}

module.exports = new WhatsAppController();
