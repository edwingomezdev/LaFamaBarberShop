const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class UsuariosService {

    async obtenerPorTelefono(telefono) {

        return prisma.usuario.findFirst({
            where: {
                telefono
            }
        });

    }

    async crearDesdeWhatsApp(telefono) {

        const password = await bcrypt.hash(
            crypto.randomUUID(),
            10
        );

        return prisma.usuario.create({

            data: {

                nombre: "Cliente WhatsApp",

                telefono,

                email: `${telefono}@whatsapp.local`,

                password,

            }

        });

    }

    async obtenerOCrearPorTelefono(telefono) {

        let usuario =
            await this.obtenerPorTelefono(telefono);

        if (usuario) {
            return usuario;
        }

        return this.crearDesdeWhatsApp(telefono);

    }

}

module.exports = new UsuariosService();