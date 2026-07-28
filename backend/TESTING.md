# Pruebas de la Parte 4

1. Crear la base con `sql/schema.sql`. Si la base ya existia, agregar la columna `saldo_dolares` indicada al final del archivo.
2. Copiar `.env.example` como `.env` y completar las credenciales locales.
3. Ejecutar `npm install`, luego `npm test` y `npm run dev` desde `backend`.
4. Iniciar sesion con un cliente y usar el token recibido como `Authorization: Bearer <token>`.

Casos manuales a verificar:

- `POST /api/transferencias`: saldo insuficiente, destinatario inexistente, transferencia a si mismo y transferencia valida. La transferencia valida debe crear un movimiento para ambas cuentas.
- `GET /api/movimientos`: solo debe mostrar los movimientos del usuario autenticado.
- `POST /api/inversiones`: debe descontar el saldo y registrar un movimiento.
- `POST /api/comprar-dolares`: debe descontar pesos, acreditar `saldo_dolares` y registrar un movimiento.
- `GET` y `POST /api/tarjetas`: deben listar o emitir tarjetas del usuario autenticado.
- Un token de administrador debe recibir `403` en estas rutas de cliente.
