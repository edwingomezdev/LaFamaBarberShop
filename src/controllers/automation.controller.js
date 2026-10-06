const automationService = require("../services/automation.service");

class AutomationController {
    async getMenu(req, res, next) {
        try {
            const result = await automationService.getMenu();

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getServices(req, res, next) {
        try {
            const result = await automationService.getServices();

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async chat(req, res, next) {
        try {

            const { phone, message } = req.body;

            const result = await automationService.chat({ phone, message });

            return res.status(200).json(result);

        } catch (error) {
            next(error);
        }
    }
}
module.exports = new AutomationController();