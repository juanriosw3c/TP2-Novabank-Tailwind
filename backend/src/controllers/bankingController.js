const db = require("../../db");
const { createBankingService } = require("../services/bankingService");

const banking = createBankingService(db);

const handle = (handler) => async (req, res) => {
  try {
    const data = await handler(req);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error en operacion bancaria:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "No se pudo completar la operacion bancaria.",
    });
  }
};

exports.resolveRecipient = handle((req) => banking.resolveRecipient(req.query.destino));
exports.getMovements = handle((req) => banking.listMovements(req.usuario.id));
exports.transfer = handle((req) => banking.transfer({ senderId: req.usuario.id, ...req.body }));
exports.getInvestments = handle((req) => banking.listInvestments(req.usuario.id));
exports.createInvestment = handle((req) => banking.createInvestment({ userId: req.usuario.id, ...req.body }));
exports.buyDollars = handle((req) => banking.buyDollars({ userId: req.usuario.id, ...req.body }));
exports.getCards = handle((req) => banking.listCards(req.usuario.id));
exports.createCard = handle((req) => banking.createCard({ userId: req.usuario.id, ...req.body }));
exports.getCardCvv = handle((req) => banking.getCardCvv({ userId: req.usuario.id, cardId: req.params.cardId, ...req.body }));
exports.setCardFrozen = handle((req) => banking.setCardFrozen({ userId: req.usuario.id, cardId: req.params.cardId, ...req.body }));
exports.deleteCard = handle((req) => banking.deleteCard({ userId: req.usuario.id, cardId: req.params.cardId, ...req.body }));
