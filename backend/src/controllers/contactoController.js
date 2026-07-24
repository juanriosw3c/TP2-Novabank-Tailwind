const contactoModel = require("../models/contactoModel");

const listar = async (req, res) => {
  try {
    const contactos = await contactoModel.listarPorUsuario(req.usuario.id);

    return res.status(200).json({
      success: true,
      contactos,
    });
  } catch (error) {
    console.error("Error al listar contactos:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al obtener los contactos.",
    });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, alias, cbu, banco, referencia } = req.body;

    if (!nombre || !alias || !cbu) {
      return res.status(400).json({
        success: false,
        message: "Nombre, alias y CBU son obligatorios.",
      });
    }

    const contacto = await contactoModel.crear({
      usuario_id: req.usuario.id,
      nombre,
      alias,
      cbu,
      banco,
      referencia,
    });

    return res.status(201).json({
      success: true,
      contacto,
    });
  } catch (error) {
    console.error("Error al crear contacto:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al crear el contacto.",
    });
  }
};

const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const contacto = await contactoModel.buscarPorId(id);

    if (!contacto || contacto.usuario_id !== req.usuario.id) {
      return res.status(404).json({
        success: false,
        message: "Contacto no encontrado.",
      });
    }

    const { referencia, favorito } = req.body || {};
    const campos = {};

    if (referencia !== undefined) campos.referencia = referencia;
    if (favorito !== undefined) campos.favorito = favorito;

    const actualizado = await contactoModel.actualizar(id, campos);

    return res.status(200).json({
      success: true,
      contacto: actualizado,
    });
  } catch (error) {
    console.error("Error al actualizar contacto:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al actualizar el contacto.",
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const contacto = await contactoModel.buscarPorId(id);

    if (!contacto || contacto.usuario_id !== req.usuario.id) {
      return res.status(404).json({
        success: false,
        message: "Contacto no encontrado.",
      });
    }

    await contactoModel.eliminar(id);

    return res.status(200).json({
      success: true,
      message: "Contacto eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar contacto:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al eliminar el contacto.",
    });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar,
};
