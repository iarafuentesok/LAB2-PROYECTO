-- Base de datos para Artesanos.com
CREATE DATABASE IF NOT EXISTS artesanos_db;
USE artesanos_db;

-- Usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  imagen_perfil VARCHAR(255),
  intereses TEXT,
  antecedentes TEXT,
  modo_vitrina BOOLEAN DEFAULT FALSE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Álbumes
CREATE TABLE albumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Imágenes
CREATE TABLE imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_album INT NOT NULL,
  id_usuario INT NOT NULL,
  url_archivo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  visibilidad ENUM('publica','privada','compartida') DEFAULT 'publica',
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_album) REFERENCES albumes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Control de visibilidad personalizada (solo si visibilidad = 'compartida')
CREATE TABLE imagenes_compartidas (
  id_imagen INT NOT NULL,
  id_usuario INT NOT NULL,
  PRIMARY KEY (id_imagen, id_usuario),
  FOREIGN KEY (id_imagen) REFERENCES imagenes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Comentarios
CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_imagen INT NOT NULL,
  id_usuario INT NOT NULL,
  comentario TEXT NOT NULL,
  fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_imagen) REFERENCES imagenes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Solicitudes de amistad
CREATE TABLE solicitudes_amistad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_remitente INT NOT NULL,
  id_destinatario INT NOT NULL,
  estado ENUM('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL,
  FOREIGN KEY (id_remitente) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_destinatario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Amistades confirmadas (una sola fila por par, con restricción para evitar duplicados)
CREATE TABLE amistades (
  id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, -- seguidor
  id_amigo INT NOT NULL,   -- seguido
  fecha_amistad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_seguidor (id_usuario, id_amigo),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_amigo) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Notificaciones
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo ENUM('amistad','comentario','evento') NOT NULL,
  mensaje VARCHAR(255),
  url VARCHAR(255),
  leido BOOLEAN DEFAULT FALSE,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Etiquetas
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Relación many-to-many imagenes <-> tags
CREATE TABLE imagenes_tags (
  id_imagen INT NOT NULL,
  id_tag INT NOT NULL,
  PRIMARY KEY (id_imagen, id_tag),
  FOREIGN KEY (id_imagen) REFERENCES imagenes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_tag) REFERENCES tags(id) ON DELETE CASCADE
);

-- Eventos
CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_evento DATE NOT NULL,
  lugar VARCHAR(255),
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inscripciones a eventos
CREATE TABLE inscripciones_evento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_evento INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_evento) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Reportes de contenido
CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_contenido INT NOT NULL,
  tipo_contenido ENUM('imagen','comentario') NOT NULL,
  motivo TEXT NOT NULL,
  fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices útiles para rendimiento
CREATE INDEX idx_usuario_album ON albumes(id_usuario);
CREATE INDEX idx_album_imagen ON imagenes(id_album);
CREATE INDEX idx_imagen_comentario ON comentarios(id_imagen);
CREATE INDEX idx_evento_fecha ON eventos(fecha_evento);
