const express = require("express");
const usuarioController = require("../controllers/usuarioController");
const auth = require("../middleware/auth");
const requireClient = require("../middleware/requireClient");

const router = express.Router();

router.use(auth, requireClient);

router.get("/me", usuarioController.obtenerPerfil);
router.get("/resolver", usuarioController.resolverDestinatario);

module.exports = router;
