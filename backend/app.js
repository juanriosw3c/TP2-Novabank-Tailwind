require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./src/routes/authRoutes");
const bankingRoutes = require("./src/routes/bankingRoutes");

const app = express();
const PORT = process.env.PORT || 8888;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", bankingRoutes);
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "¡Servidor de NovaBank corriendo correctamente!",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS resultado");
    res.json({
      success: true,
      message: "¡Conexión a la base de datos exitosa!",
      resultado: rows[0].resultado,
    });
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    res.status(500).json({
      success: false,
      message: "Error al conectar a la base de datos",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  console.log(`=========================================`);
});
