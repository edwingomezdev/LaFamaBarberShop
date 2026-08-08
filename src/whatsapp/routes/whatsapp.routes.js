const express = require("express");

const router = express.Router();

const whatsappController =
    require("../controllers/whatsapp.controller");

router.get(
    "/webhook",
    whatsappController.verify
);

router.post(
    "/webhook",
    whatsappController.receive
);

module.exports = router;