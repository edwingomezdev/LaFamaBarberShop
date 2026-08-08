require("../config/env");

const metaConfig = require("../config/meta.config");
const whatsappService = require("./services/whatsapp.service");

console.log("========== META CONFIG ==========");
console.log({
    graphApiVersion: metaConfig.graphApiVersion,
    phoneNumberId: metaConfig.phoneNumberId,
    accessTokenLoaded: !!metaConfig.accessToken
});
console.log("=================================");

async function main() {

    try {

        const response = await whatsappService.sendTextMessage(

            "573113622003", // <-- reemplaza por tu número autorizado

            "Hola desde La Fama Barber 💈"

        );

        console.log("✅ RESPUESTA META:");
        console.log(response);

    } catch (error) {

        console.log("=========== ERROR META ===========");

        if (error.response) {

            console.log("Status:", error.response.status);

            console.log(
                JSON.stringify(error.response.data, null, 2)
            );

        } else {

            console.log(error.message);

        }

        console.log("==================================");
    }

}

main();