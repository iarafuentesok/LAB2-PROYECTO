import bcrypt from "bcryptjs";
import { db } from "../db.js";

export const registrarUsuario = async (req, res) => {
  console.log("LLEGÓ LA PETICIÓN", req.body);
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios." });
    }

    const [usuarios] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length > 0) {
      return res.status(409).json({ mensaje: "El email ya está registrado." });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, passwordEncriptada]
    );

    res.status(201).json({ mensaje: "Usuario registrado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
};

export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [usuarios] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query(
      "SELECT id, nombre, email, imagen_perfil, intereses, antecedentes FROM usuarios WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener el perfil" });
  }
};
