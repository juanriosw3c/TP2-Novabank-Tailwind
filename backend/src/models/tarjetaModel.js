const db = require("../../db");

const listarPorUsuario = async (usuarioId) => {
  const [rows] = await db.execute(
    `SELECT id, usuario_id, tipo, numero, titular, vencimiento, cvv, congelada
     FROM tarjetas
     WHERE usuario_id = ?`,
    [usuarioId]
  );

  return rows;
};

const buscarPorId = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, usuario_id, tipo, numero, titular, vencimiento, cvv, congelada
     FROM tarjetas
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const crear = async ({ usuario_id, tipo, numero, titular, vencimiento, cvv }) => {
  const [result] = await db.execute(
    `INSERT INTO tarjetas
      (usuario_id, tipo, numero, titular, vencimiento, cvv)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, tipo, numero, titular, vencimiento, cvv]
  );

  return await buscarPorId(result.insertId);
};

const actualizarCongelada = async (id, congelada) => {
  await db.execute("UPDATE tarjetas SET congelada = ? WHERE id = ?", [
    congelada ? 1 : 0,
    id,
  ]);

  return await buscarPorId(id);
};

const eliminar = async (id) => {
  await db.execute("DELETE FROM tarjetas WHERE id = ?", [id]);
};

module.exports = {
  listarPorUsuario,
  buscarPorId,
  crear,
  actualizarCongelada,
  eliminar,
};
