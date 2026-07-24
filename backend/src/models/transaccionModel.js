const db = require("../../db");

const crear = async ({ usuario_id, tipo, titulo, monto, icono }, conn = db) => {
  const [result] = await conn.execute(
    `INSERT INTO transacciones
      (usuario_id, tipo, titulo, monto, icono)
     VALUES (?, ?, ?, ?, ?)`,
    [usuario_id, tipo, titulo, monto, icono]
  );

  return result.insertId;
};

const listarPorUsuario = async (usuarioId) => {
  const [rows] = await db.execute(
    `SELECT id, usuario_id, tipo, titulo, monto, icono, fecha
     FROM transacciones
     WHERE usuario_id = ?
     ORDER BY fecha DESC`,
    [usuarioId]
  );

  return rows;
};

module.exports = {
  crear,
  listarPorUsuario,
};
