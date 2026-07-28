const express = require("express");
const auth = require("../middleware/auth");
const requireClient = require("../middleware/requireClient");
const bankingController = require("../controllers/bankingController");

const router = express.Router();

router.use(auth, requireClient);
router.get("/usuarios/resolver", bankingController.resolveRecipient);
router.get("/movimientos", bankingController.getMovements);
router.post("/transferencias", bankingController.transfer);
router.get("/inversiones", bankingController.getInvestments);
router.post("/inversiones", bankingController.createInvestment);
router.post("/comprar-dolares", bankingController.buyDollars);
router.get("/tarjetas", bankingController.getCards);
router.post("/tarjetas", bankingController.createCard);
router.post("/tarjetas/:cardId/cvv", bankingController.getCardCvv);
router.patch("/tarjetas/:cardId/congelar", bankingController.setCardFrozen);
router.delete("/tarjetas/:cardId", bankingController.deleteCard);

module.exports = router;
