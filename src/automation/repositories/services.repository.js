const serviciosService = require("../../services/servicios.service");

class ServicesRepository {

    async getAll() {
        return serviciosService.listar();
    }

    async findByName(name) {

        const services = await serviciosService.listar();

        return services.find(service =>
            service.nombre.toLowerCase() === name.trim().toLowerCase()
        );

    }

}

module.exports = new ServicesRepository();