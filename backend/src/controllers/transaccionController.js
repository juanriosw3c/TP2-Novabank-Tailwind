const db = require("../../db");
const usuarioModel = require("../models/usuarioModel");
const transaccionModel = require("../models/transaccionModel");

const INVERSION_LABELS = {
  "plazo-fijo": "Plazo fijo UVA",
  "fondo-comun": "Fondo común de inversión",
  "dolar-mep": "Dólar MEP",
  acciones: "Acciones",
};

const runInTransaction = async (work) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const listar = async (req, res) => {
  try {
    const transacciones = await transaccionModel.listarPorUsuario(req.usuario.id);

    return res.status(200).json({
      success: true,
      transacciones,
    });
  } catch (error) {
    console.error("Error al listar transacciones:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al obtener los movimientos.",
    });
  }
};

const transferir = async (req, res) => {
  try {
    const { destino, monto, mensaje } = req.body;
    const montoNum = Number(monto);

    if (!destino || !montoNum || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Destino y monto son obligatorios, y el monto debe ser mayor a cero.",
      });
    }

    const receptor = await usuarioModel.findByCbuOrAlias(String(destino).trim());

    if (!receptor) {
      return res.status(404).json({
        success: false,
        message: "No se encontró ninguna cuenta con ese CBU, CVU o alias.",
      });
    }

    if (receptor.id === req.usuario.id) {
      return res.status(400).json({
        success: false,
        message: "No podés transferirte a vos mismo.",
      });
    }

    const emisor = await usuarioModel.findById(req.usuario.id);

    await runInTransaction(async (conn) => {
      const [rows] = await conn.execute(
        "SELECT saldo FROM usuarios WHERE id = ? FOR UPDATE",
        [req.usuario.id]
      );

      const saldoActual = Number(rows[0].saldo);

      if (saldoActual < montoNum) {
        throw Object.assign(new Error("Saldo insuficiente."), { status: 400 });
      }

      await usuarioModel.ajustarSaldo(req.usuario.id, -montoNum, conn);
      await usuarioModel.ajustarSaldo(receptor.id, montoNum, conn);

      await transaccionModel.crear(
        {
          usuario_id: req.usuario.id,
          tipo: "transfer",
          titulo: `Transferencia a ${receptor.nombre}`,
          monto: -montoNum,
          icono: "transfer",
        },
        conn
      );

      await transaccionModel.crear(
        {
          usuario_id: receptor.id,
          tipo: "transfer",
          titulo: `Transferencia de ${emisor.nombre}`,
          monto: montoNum,
          icono: "transfer",
        },
        conn
      );
    });

    return res.status(200).json({
      success: true,
      message: "Transferencia realizada correctamente.",
      destinatario: {
        nombre: receptor.nombre,
        alias: receptor.alias,
        cbu: receptor.cbu,
      },
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error al transferir:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al realizar la transferencia.",
    });
  }
};

const invertir = async (req, res) => {
  try {
    const { tipo, monto } = req.body;
    const montoNum = Number(monto);
    const label = INVERSION_LABELS[tipo];

    if (!label) {
      return res.status(400).json({
        success: false,
        message: "Seleccioná un tipo de inversión válido.",
      });
    }

    if (!montoNum || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "El monto debe ser mayor a cero.",
      });
    }

    await runInTransaction(async (conn) => {
      const [rows] = await conn.execute(
        "SELECT saldo FROM usuarios WHERE id = ? FOR UPDATE",
        [req.usuario.id]
      );

      const saldoActual = Number(rows[0].saldo);

      if (saldoActual < montoNum) {
        throw Object.assign(new Error("Saldo insuficiente."), { status: 400 });
      }

      await usuarioModel.ajustarSaldo(req.usuario.id, -montoNum, conn);

      await transaccionModel.crear(
        {
          usuario_id: req.usuario.id,
          tipo: "expense",
          titulo: `Inversión: ${label}`,
          monto: -montoNum,
          icono: "investment",
        },
        conn
      );
    });

    return res.status(200).json({
      success: true,
      message: "Inversión realizada correctamente.",
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error al invertir:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al procesar la inversión.",
    });
  }
};

module.exports = {
  listar,
  transferir,
  invertir,
};
