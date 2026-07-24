const express = require("express");
const contactoController = require("../controllers/contactoController");
const auth = require("../middleware/auth");
const requireClient = require("../middleware/requireClient");

const router = express.Router();

router.use(auth, requireClient);

router.get("/", contactoController.listar);
router.post("/", contactoController.crear);
router.patch("/:id", contactoController.actualizar);
router.delete("/:id", contactoController.eliminar);

module.exports = router;
