const test = require("node:test");
const assert = require("node:assert/strict");
const { parseAmount, generateCardNumber, generateCvv } = require("../src/services/bankingService");

test("acepta montos positivos con hasta dos decimales", () => {
  assert.equal(parseAmount("123.456"), 123.46);
  assert.equal(parseAmount(10), 10);
});

test("rechaza montos vacios, negativos o no numericos", () => {
  for (const value of ["", 0, -1, "abc"]) {
    assert.throws(() => parseAmount(value), { status: 400 });
  }
});

test("las tarjetas generadas respetan el prefijo y tienen 16 digitos", () => {
  const debit = generateCardNumber("4509");
  const credit = generateCardNumber("5364");
  assert.match(debit, /^4509\d{12}$/);
  assert.match(credit, /^5364\d{12}$/);
});

test("el CVV generado siempre tiene tres digitos", () => {
  for (let index = 0; index < 20; index += 1) assert.match(generateCvv(), /^\d{3}$/);
});
