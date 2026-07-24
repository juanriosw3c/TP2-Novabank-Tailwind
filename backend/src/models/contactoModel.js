const db = require("../../db");

const listarPorUsuario = async (usuarioId) => {
  const [rows] = await db.execute(
    `SELECT id, usuario_id, nombre, alias, cbu, banco, referencia, favorito
     FROM contactos
     WHERE usuario_id = ?`,
    [usuarioId]
  );

  return rows;
};

const buscarPorId = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, usuario_id, nombre, alias, cbu, banco, referencia, favorito
     FROM contactos
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const crear = async ({ usuario_id, nombre, alias, cbu, banco, referencia }) => {
  const [result] = await db.execute(
    `INSERT INTO contactos
      (usuario_id, nombre, alias, cbu, banco, referencia)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, nombre, alias, cbu, banco || "NovaBank", referencia || ""]
  );

  return await buscarPorId(result.insertId);
};

const actualizar = async (id, campos) => {
  const permitidos = ["referencia", "favorito"];
  const sets = [];
  const valores = [];

  for (const campo of permitidos) {
    if (campo in campos) {
      sets.push(`${campo} = ?`);
      valores.push(campo === "favorito" ? (campos[campo] ? 1 : 0) : campos[campo]);
    }
  }

  if (sets.length === 0) {
    return await buscarPorId(id);
  }

  valores.push(id);

  await db.execute(`UPDATE contactos SET ${sets.join(", ")} WHERE id = ?`, valores);

  return await buscarPorId(id);
};

const eliminar = async (id) => {
  await db.execute("DELETE FROM contactos WHERE id = ?", [id]);
};

module.exports = {
  listarPorUsuario,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};
