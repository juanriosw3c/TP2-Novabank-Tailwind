const express = require("express");
const tarjetaController = require("../controllers/tarjetaController");
const auth = require("../middleware/auth");
const requireClient = require("../middleware/requireClient");

const router = express.Router();

router.use(auth, requireClient);

router.get("/", tarjetaController.listar);
router.post("/", tarjetaController.crear);
router.patch("/:id", tarjetaController.actualizar);
router.delete("/:id", tarjetaController.eliminar);

module.exports = router;
