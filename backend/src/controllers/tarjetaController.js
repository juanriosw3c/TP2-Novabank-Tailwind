const tarjetaModel = require("../models/tarjetaModel");
const usuarioModel = require("../models/usuarioModel");

const generarDigitos = (length) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

const listar = async (req, res) => {
  try {
    const tarjetas = await tarjetaModel.listarPorUsuario(req.usuario.id);

    return res.status(200).json({
      success: true,
      tarjetas,
    });
  } catch (error) {
    console.error("Error al listar tarjetas:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al obtener las tarjetas.",
    });
  }
};

const crear = async (req, res) => {
  try {
    const { tipo } = req.body;

    if (tipo !== "debito" && tipo !== "credito") {
      return res.status(400).json({
        success: false,
        message: "El tipo de tarjeta debe ser 'debito' o 'credito'.",
      });
    }

    const usuario = await usuarioModel.findById(req.usuario.id);
    const esCredito = tipo === "credito";
    const prefix = esCredito ? "5364" : "4509";

    const hoy = new Date();
    const anioVencimiento = String(hoy.getFullYear() + 4).slice(-2);
    const mesVencimiento = String(hoy.getMonth() + 1).padStart(2, "0");

    let tarjeta = null;
    let intentos = 0;

    while (!tarjeta && intentos < 5) {
      intentos += 1;
      const numero = `${prefix}${generarDigitos(16 - prefix.length)}`;
      const cvv = generarDigitos(3);

      try {
        tarjeta = await tarjetaModel.crear({
          usuario_id: req.usuario.id,
          tipo: esCredito ? "Crédito NovaBank" : "Débito NovaBank",
          numero,
          titular: usuario.nombre,
          vencimiento: `${mesVencimiento}/${anioVencimiento}`,
          cvv,
        });
      } catch (error) {
        if (error.code !== "ER_DUP_ENTRY") {
          throw error;
        }
      }
    }

    if (!tarjeta) {
      return res.status(500).json({
        success: false,
        message: "No se pudo generar una tarjeta única, intentá de nuevo.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Tarjeta creada correctamente.",
      tarjeta,
    });
  } catch (error) {
    console.error("Error al crear tarjeta:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al crear la tarjeta.",
    });
  }
};

const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const tarjeta = await tarjetaModel.buscarPorId(id);

    if (!tarjeta || tarjeta.usuario_id !== req.usuario.id) {
      return res.status(404).json({
        success: false,
        message: "Tarjeta no encontrada.",
      });
    }

    const body = req.body || {};
    const congelada = "congelada" in body ? body.congelada : !tarjeta.congelada;
    const actualizada = await tarjetaModel.actualizarCongelada(id, congelada);

    return res.status(200).json({
      success: true,
      tarjeta: actualizada,
    });
  } catch (error) {
    console.error("Error al actualizar tarjeta:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al actualizar la tarjeta.",
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const tarjeta = await tarjetaModel.buscarPorId(id);

    if (!tarjeta || tarjeta.usuario_id !== req.usuario.id) {
      return res.status(404).json({
        success: false,
        message: "Tarjeta no encontrada.",
      });
    }

    await tarjetaModel.eliminar(id);

    return res.status(200).json({
      success: true,
      message: "Tarjeta eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar tarjeta:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al eliminar la tarjeta.",
    });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar,
};
