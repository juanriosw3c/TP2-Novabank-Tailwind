const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

const generateToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

const register = async (req, res) => {
  try {
    const { nombre, email, contrasena, dni } = req.body;

    if (!nombre || !email || !contrasena || !dni) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios.",
      });
    }

    const existingUser = await usuarioModel.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un usuario con ese correo electrónico.",
      });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const usuario = await usuarioModel.createUser({
      nombre,
      email,
      contrasena: hashedPassword,
      dni,
    });

    const token = generateToken(usuario);

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente.",
      token,
      usuario,
    });
 } catch (error) {
  console.error("========== ERROR REGISTER ==========");
  console.error(error);
  console.error("Mensaje:", error.message);
  console.error("Código:", error.code);
  console.error("Stack:", error.stack);
  console.error("===================================");

  return res.status(500).json({
    success: false,
    message: error.message,
    code: error.code || null,
  });
}
};

const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({
        success: false,
        message: "El correo y la contraseña son obligatorios.",
      });
    }

    const usuario = await usuarioModel.findByEmail(email);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos.",
      });
    }

    const validPassword = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos.",
      });
    }

    if (usuario.estado !== "Cuenta activa") {
      return res.status(403).json({
        success: false,
        message: "La cuenta no se encuentra activa.",
      });
    }

    const token = generateToken(usuario);

    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto.",
      token,
      usuario: usuarioSinContrasena,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al iniciar sesión.",
    });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { contrasena } = req.body;
    if (!contrasena) {
      return res.status(400).json({ success: false, message: "La contrasena es obligatoria." });
    }
    const usuario = await usuarioModel.findWithPasswordById(req.usuario.id);
    const validPassword = usuario && await bcrypt.compare(contrasena, usuario.contrasena);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Contrasena incorrecta." });
    }
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "No se pudo verificar la contrasena." });
  }
};

module.exports = {
  register,
  login,
  verifyPassword,
};
