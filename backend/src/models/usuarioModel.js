const db = require("../../db");

const findByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.execute(
    `SELECT
      id,
      nombre,
      email,
      dni,
      rol,
      estado,
      cbu,
      alias,
      saldo,
      fecha_creacion,
      fecha_modificacion
    FROM usuarios
    WHERE id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const createUser = async ({ nombre, email, contrasena, dni }) => {
  const [result] = await db.execute(
    `INSERT INTO usuarios
      (nombre, email, contrasena, dni)
     VALUES (?, ?, ?, ?)`,
    [nombre, email, contrasena, dni]
  );

  return await findById(result.insertId);
};

const findWithPasswordById = async (id) => {
  const [rows] = await db.execute(
    "SELECT id, contrasena FROM usuarios WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  findWithPasswordById,
};
