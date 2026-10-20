module.exports = {
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  appSecret: process.env.META_APP_SECRET,
  graphApiVersion: process.env.GRAPH_API_VERSION || 'v23.0',
}
