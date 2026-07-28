const requireClient = (req, res, next) => {
  if (req.usuario?.rol !== "client") {
    return res.status(403).json({
      success: false,
      message: "Esta operacion solo esta disponible para clientes.",
    });
  }

  next();
};

module.exports = requireClient;
