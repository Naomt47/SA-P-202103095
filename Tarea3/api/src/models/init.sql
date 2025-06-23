CREATE DATABASE cmdb;
USE cmdb;

-- Crear tabla para tipos de CI
CREATE TABLE Tipo_CI (
  id_tipo_ci INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tipo VARCHAR(50) UNIQUE NOT NULL
);

-- Crear tabla para ítems de configuración (CI)
CREATE TABLE CI (
  id_ci INT AUTO_INCREMENT PRIMARY KEY,
  nombre_ci VARCHAR(255) UNIQUE NOT NULL,
  id_tipo_ci INT,
  descripcion TEXT,
  numero_serie VARCHAR(100),
  version VARCHAR(50),
  fecha_adquisicion DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado_actual ENUM('Activo', 'Inactivo', 'En Mantenimiento', 'Retirado') DEFAULT NULL,
  ubicacion_fisica VARCHAR(255),
  propietario_responsable VARCHAR(255),
  niveles_seguridad ENUM('Alto', 'Medio', 'Bajo') DEFAULT NULL,
  cumplimiento ENUM('Cumple', 'No Cumple', 'Pendiente') DEFAULT NULL,
  estado_configuracion ENUM('Aprobado', 'Pendiente', 'Rechazado') DEFAULT NULL,
  numero_licencia VARCHAR(100),
  fecha_vencimiento DATE,
  ambiente ENUM('DEV', 'QA', 'PROD') NOT NULL,
  FOREIGN KEY (id_tipo_ci) REFERENCES Tipo_CI(id_tipo_ci) ON DELETE RESTRICT
);

-- Crear tabla para relaciones entre CIs
CREATE TABLE Relacion_CI (
  id_relacion INT AUTO_INCREMENT PRIMARY KEY,
  id_ci_origen INT,
  id_ci_destino INT,
  tipo_relacion VARCHAR(50),
  FOREIGN KEY (id_ci_origen) REFERENCES CI(id_ci) ON DELETE CASCADE,
  FOREIGN KEY (id_ci_destino) REFERENCES CI(id_ci) ON DELETE CASCADE
);

-- Crear tabla para auditoría
CREATE TABLE Auditoria (
  id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
  id_ci INT NULL,
  nombre_ci VARCHAR(255),
  fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion_cambio TEXT,
  usuario VARCHAR(100) NOT NULL
);

-- Crear tabla para documentación
CREATE TABLE Documentacion (
  id_documentacion INT AUTO_INCREMENT PRIMARY KEY,
  id_ci INT,
  enlace_documentacion VARCHAR(255) NOT NULL,
  FOREIGN KEY (id_ci) REFERENCES CI(id_ci) ON DELETE CASCADE
);

-- Crear tabla para incidentes y problemas
CREATE TABLE Incidentes_Problemas (
  id_incidente_problema INT AUTO_INCREMENT PRIMARY KEY,
  id_ci INT,
  enlace_incidente_problema VARCHAR(255) NOT NULL,
  FOREIGN KEY (id_ci) REFERENCES CI(id_ci) ON DELETE CASCADE
);