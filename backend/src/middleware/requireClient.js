const requireClient = (req, res, next) => {
  if (req.usuario?.rol !== "client") {
    return res.status(403).json({
      success: false,
      message: "Acceso permitido solo para clientes.",
    });
  }

  next();
};

module.exports = requireClient;
