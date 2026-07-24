const usuarioModel = require("../models/usuarioModel");

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await usuarioModel.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al obtener el perfil.",
    });
  }
};

const resolverDestinatario = async (req, res) => {
  try {
    const destino = String(req.query.destino || "").trim();

    if (!destino) {
      return res.status(400).json({
        success: false,
        message: "Ingresá un CBU, CVU o alias para buscar.",
      });
    }

    const usuario = await usuarioModel.findByCbuOrAlias(destino);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "No se encontró ninguna cuenta con ese CBU, CVU o alias.",
      });
    }

    return res.status(200).json({
      success: true,
      destinatario: {
        nombre: usuario.nombre,
        alias: usuario.alias,
        cbu: usuario.cbu,
      },
    });
  } catch (error) {
    console.error("Error al resolver destinatario:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al buscar el destinatario.",
    });
  }
};

module.exports = {
  obtenerPerfil,
  resolverDestinatario,
};
