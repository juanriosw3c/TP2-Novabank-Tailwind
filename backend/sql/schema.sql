-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  rol ENUM('client', 'admin') DEFAULT 'client',
  estado VARCHAR(50) DEFAULT 'Cuenta activa',
  cbu VARCHAR(22) UNIQUE NULL,
  alias VARCHAR(50) UNIQUE NULL,
  saldo DECIMAL(15, 2) DEFAULT 0.00,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de tarjetas
CREATE TABLE IF NOT EXISTS tarjetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  numero VARCHAR(19) NOT NULL UNIQUE,
  titular VARCHAR(100) NOT NULL,
  vencimiento VARCHAR(5) NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  congelada TINYINT(1) DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('transfer', 'income', 'expense') NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  monto DECIMAL(15, 2) NOT NULL,
  icono VARCHAR(50) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear tabla de auditorías (logs del administrador)
CREATE TABLE IF NOT EXISTS auditorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_name VARCHAR(100) NOT NULL,
  accion VARCHAR(255) NOT NULL,
  usuario_destino VARCHAR(100) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('success', 'info', 'warning', 'critical') DEFAULT 'success',
  tipo VARCHAR(50) DEFAULT 'system'
);

-- Crear tabla de contactos (agenda de destinatarios frecuentes de cada usuario)
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  alias VARCHAR(50) NOT NULL,
  cbu VARCHAR(22) NOT NULL,
  banco VARCHAR(100) DEFAULT 'NovaBank',
  referencia VARCHAR(255) DEFAULT '',
  favorito TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
