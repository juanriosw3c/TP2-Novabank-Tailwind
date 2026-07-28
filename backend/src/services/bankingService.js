const bcrypt = require("bcrypt");

const createHttpError = (status, message) => Object.assign(new Error(message), { status });

const parseAmount = (value, field = "El monto") => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError(400, `${field} debe ser un numero mayor a cero.`);
  }
  return Math.round(amount * 100) / 100;
};

const lastFour = (number) => number.replace(/\D/g, "").slice(-4);

const generateCardNumber = (prefix) => {
  const digits = `${prefix}${Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")}`;
  return digits.slice(0, 16);
};

const generateCvv = () => String(Math.floor(100 + Math.random() * 900));

const getExpiry = () => {
  const date = new Date();
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String((date.getFullYear() + 3) % 100).padStart(2, "0")}`;
};

const createBankingService = (db) => ({
  async resolveRecipient(destination) {
    const value = String(destination || "").trim().toLowerCase();
    if (!value) throw createHttpError(400, "El CBU o alias es obligatorio.");
    const [rows] = await db.execute(
      `SELECT id, nombre, alias, cbu FROM usuarios WHERE rol = 'client' AND estado = 'Cuenta activa' AND (LOWER(alias) = ? OR cbu = ?) LIMIT 1`,
      [value, value]
    );
    if (!rows[0]) throw createHttpError(404, "No se encontro ninguna cuenta con ese CBU, CVU o alias.");
    return rows[0];
  },
  async listMovements(userId) {
    const [rows] = await db.execute(
      `SELECT id, tipo, titulo, monto, icono, fecha
       FROM transacciones WHERE usuario_id = ? ORDER BY fecha DESC, id DESC`,
      [userId]
    );
    return rows;
  },

  async transfer({ senderId, destination, amount, message = "" }) {
    const cleanDestination = String(destination || "").trim().toLowerCase();
    if (!cleanDestination) throw createHttpError(400, "El CBU o alias del destinatario es obligatorio.");
    const transferAmount = parseAmount(amount);
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      const [senders] = await connection.execute(
        "SELECT id, nombre, saldo FROM usuarios WHERE id = ? AND estado = 'Cuenta activa' FOR UPDATE",
        [senderId]
      );
      const [recipients] = await connection.execute(
        "SELECT id, nombre, saldo FROM usuarios WHERE LOWER(alias) = ? OR cbu = ? FOR UPDATE",
        [cleanDestination, cleanDestination]
      );
      const sender = senders[0];
      const recipient = recipients[0];
      if (!sender) throw createHttpError(404, "Cuenta de origen no encontrada o inactiva.");
      if (!recipient) throw createHttpError(404, "Destinatario no encontrado.");
      if (sender.id === recipient.id) throw createHttpError(400, "No podes transferirte a vos mismo.");
      if (Number(sender.saldo) < transferAmount) throw createHttpError(400, "Saldo insuficiente.");

      await connection.execute("UPDATE usuarios SET saldo = saldo - ? WHERE id = ?", [transferAmount, sender.id]);
      await connection.execute("UPDATE usuarios SET saldo = saldo + ? WHERE id = ?", [transferAmount, recipient.id]);
      await connection.execute(
        "INSERT INTO transacciones (usuario_id, tipo, titulo, monto, icono) VALUES (?, 'expense', ?, ?, 'transfer')",
        [sender.id, `Transferencia a ${recipient.nombre}${message ? ` - ${message.trim()}` : ""}`, transferAmount]
      );
      await connection.execute(
        "INSERT INTO transacciones (usuario_id, tipo, titulo, monto, icono) VALUES (?, 'income', ?, ?, 'transfer')",
        [recipient.id, `Transferencia de ${sender.nombre}`, transferAmount]
      );
      await connection.commit();
      return { recipient: { id: recipient.id, nombre: recipient.nombre }, amount: transferAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async listInvestments(userId) {
    const [rows] = await db.execute(
      "SELECT id, tipo, monto, estado, fecha_creacion FROM inversiones WHERE usuario_id = ? ORDER BY fecha_creacion DESC",
      [userId]
    );
    return rows;
  },

  async createInvestment({ userId, type, amount }) {
    if (!String(type || "").trim()) throw createHttpError(400, "El tipo de inversion es obligatorio.");
    const investmentAmount = parseAmount(amount);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [users] = await connection.execute("SELECT saldo FROM usuarios WHERE id = ? FOR UPDATE", [userId]);
      if (!users[0]) throw createHttpError(404, "Usuario no encontrado.");
      if (Number(users[0].saldo) < investmentAmount) throw createHttpError(400, "Saldo insuficiente.");
      await connection.execute("UPDATE usuarios SET saldo = saldo - ? WHERE id = ?", [investmentAmount, userId]);
      const [result] = await connection.execute(
        "INSERT INTO inversiones (usuario_id, tipo, monto) VALUES (?, ?, ?)",
        [userId, String(type).trim(), investmentAmount]
      );
      await connection.execute(
        "INSERT INTO transacciones (usuario_id, tipo, titulo, monto, icono) VALUES (?, 'expense', ?, ?, 'investment')",
        [userId, `Inversion: ${String(type).trim()}`, investmentAmount]
      );
      await connection.commit();
      return { id: result.insertId, type: String(type).trim(), amount: investmentAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  },

  async buyDollars({ userId, amount, rate, currencyType = "oficial", destination = "caja" }) {
    const pesos = parseAmount(amount, "El monto en pesos");
    const exchangeRate = parseAmount(rate, "La cotizacion");
    const dollars = Math.round((pesos / exchangeRate) * 100) / 100;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [users] = await connection.execute("SELECT saldo FROM usuarios WHERE id = ? FOR UPDATE", [userId]);
      if (!users[0]) throw createHttpError(404, "Usuario no encontrado.");
      if (Number(users[0].saldo) < pesos) throw createHttpError(400, "Saldo insuficiente.");
      await connection.execute("UPDATE usuarios SET saldo = saldo - ?, saldo_dolares = saldo_dolares + ? WHERE id = ?", [pesos, dollars, userId]);
      await connection.execute(
        "INSERT INTO transacciones (usuario_id, tipo, titulo, monto, icono) VALUES (?, 'expense', ?, ?, 'dollar')",
        [userId, `Compra de dolar ${currencyType} para ${destination}`, pesos]
      );
      await connection.commit();
      return { pesos, dollars, rate: exchangeRate };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  },

  async listCards(userId) {
    const [rows] = await db.execute(
      "SELECT id, tipo, numero, titular, vencimiento, congelada FROM tarjetas WHERE usuario_id = ? ORDER BY id DESC",
      [userId]
    );
    return rows.map((card) => ({ ...card, ultimo4: lastFour(card.numero), congelada: Boolean(card.congelada) }));
  },

  async createCard({ userId, type, holder }) {
    const normalizedType = String(type || "").trim().toLowerCase();
    if (!["debito", "credito"].includes(normalizedType)) throw createHttpError(400, "El tipo debe ser debito o credito.");
    if (!String(holder || "").trim()) throw createHttpError(400, "El titular es obligatorio.");
    const number = generateCardNumber(normalizedType === "debito" ? "4509" : "5364");
    const [result] = await db.execute(
      "INSERT INTO tarjetas (usuario_id, tipo, numero, titular, vencimiento, cvv) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, normalizedType === "debito" ? "Debito NovaBank" : "Credito NovaBank", number, String(holder).trim(), getExpiry(), generateCvv()]
    );
    return { id: result.insertId, tipo: normalizedType, ultimo4: lastFour(number) };
  },

  async getCardCvv({ userId, cardId, password }) {
    if (!password) throw createHttpError(400, "La contrasena es obligatoria.");
    const [rows] = await db.execute(
      `SELECT t.cvv, u.contrasena FROM tarjetas t
       INNER JOIN usuarios u ON u.id = t.usuario_id
       WHERE t.id = ? AND t.usuario_id = ? LIMIT 1`,
      [cardId, userId]
    );
    const card = rows[0];
    if (!card) throw createHttpError(404, "Tarjeta no encontrada.");
    if (!await bcrypt.compare(password, card.contrasena)) throw createHttpError(401, "Contrasena incorrecta.");
    return { cvv: card.cvv };
  },

  async setCardFrozen({ userId, cardId, frozen, password }) {
    if (!password) throw createHttpError(400, "La contrasena es obligatoria.");
    const [users] = await db.execute("SELECT contrasena FROM usuarios WHERE id = ? LIMIT 1", [userId]);
    if (!users[0] || !await bcrypt.compare(password, users[0].contrasena)) throw createHttpError(401, "Contrasena incorrecta.");
    const [result] = await db.execute("UPDATE tarjetas SET congelada = ? WHERE id = ? AND usuario_id = ?", [frozen ? 1 : 0, cardId, userId]);
    if (!result.affectedRows) throw createHttpError(404, "Tarjeta no encontrada.");
    return { id: Number(cardId), frozen: Boolean(frozen) };
  },

  async deleteCard({ userId, cardId, password }) {
    if (!password) throw createHttpError(400, "La contrasena es obligatoria.");
    const [users] = await db.execute("SELECT contrasena FROM usuarios WHERE id = ? LIMIT 1", [userId]);
    if (!users[0] || !await bcrypt.compare(password, users[0].contrasena)) throw createHttpError(401, "Contrasena incorrecta.");
    const [result] = await db.execute("DELETE FROM tarjetas WHERE id = ? AND usuario_id = ?", [cardId, userId]);
    if (!result.affectedRows) throw createHttpError(404, "Tarjeta no encontrada.");
    return { id: Number(cardId) };
  },
});

module.exports = { createBankingService, parseAmount, generateCardNumber, generateCvv };
