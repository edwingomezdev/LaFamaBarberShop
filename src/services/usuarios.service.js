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

    async obtenerOCrearDesdeWhatsApp(telefono, nombre) {
        const nombreLimpio = String(nombre || '').trim().replace(/\s+/g, ' ');
        if (nombreLimpio.length < 2 || nombreLimpio.length > 80) {
            throw new Error('El nombre debe tener entre 2 y 80 caracteres');
        }

        const usuario = await this.obtenerPorTelefono(telefono);
        if (usuario) {
            return prisma.usuario.update({
                where: { id: usuario.id },
                data: { nombre: nombreLimpio },
            });
        }

        const password = await bcrypt.hash(crypto.randomUUID(), 10);
        return prisma.usuario.create({
            data: {
                nombre: nombreLimpio,
                telefono,
                email: `${telefono}@whatsapp.local`,
                password,
            },
        });
    }

}

module.exports = new UsuariosService();
