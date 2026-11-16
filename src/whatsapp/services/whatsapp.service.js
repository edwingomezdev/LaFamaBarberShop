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

    async sendReminderTemplate(to, { citaId, nombre, servicio, barbero, fechaHora }) {
        if (!process.env.WHATSAPP_REMINDER_TEMPLATE_NAME) throw new Error('Falta WHATSAPP_REMINDER_TEMPLATE_NAME')
        const url = `https://graph.facebook.com/${metaConfig.graphApiVersion}/${metaConfig.phoneNumberId}/messages`
        const body = {
            messaging_product: 'whatsapp', to, type: 'template',
            template: {
                name: process.env.WHATSAPP_REMINDER_TEMPLATE_NAME,
                language: { code: process.env.WHATSAPP_REMINDER_LANGUAGE || 'es_CO' },
                components: [
                    { type: 'body', parameters: [nombre, servicio, barbero, fechaHora].map((text) => ({ type: 'text', text: String(text).slice(0, 1000) })) },
                    ...[
                        ['ASISTIRE', 'Confirmar asistencia'],
                        ['REPROGRAMAR', 'Cambiar hora'],
                        ['CANCELAR', 'Cancelar cita'],
                    ].map(([action], index) => ({ type: 'button', sub_type: 'quick_reply', index: String(index), parameters: [{ type: 'payload', payload: `CITA_${citaId}_${action}` }] })),
                ],
            },
        }
        const response = await axios.post(url, body, { headers: { Authorization: `Bearer ${metaConfig.accessToken}`, 'Content-Type': 'application/json' } })
        return response.data
    }

}

module.exports = new WhatsAppService();
