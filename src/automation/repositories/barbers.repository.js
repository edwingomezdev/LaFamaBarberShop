const barberosService = require("../../services/barberos.service");

class BarbersRepository {

    async getAll() {
        return barberosService.listar();
    }

    async findByName(name) {

        const barbers = await barberosService.listar();

        return barbers.find(barber =>
            barber.nombre.toLowerCase() === name.trim().toLowerCase()
        );

    }

}

module.exports = new BarbersRepository();