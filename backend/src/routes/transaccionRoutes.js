const express = require("express");
const transaccionController = require("../controllers/transaccionController");
const auth = require("../middleware/auth");
const requireClient = require("../middleware/requireClient");

const router = express.Router();

router.use(auth, requireClient);

router.get("/", transaccionController.listar);
router.post("/transferencia", transaccionController.transferir);
router.post("/inversion", transaccionController.invertir);

module.exports = router;
