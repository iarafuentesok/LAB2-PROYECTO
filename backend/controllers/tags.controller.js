import { db } from '../db.js';

export const obtenerTags = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM tags ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener tags' });
  }
};

export const crearTag = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ mensaje: 'Nombre requerido' });
    }

    const [existe] = await db.query('SELECT id FROM tags WHERE nombre = ?', [nombre]);
    if (existe.length > 0) {
      return res.status(409).json({ mensaje: 'El tag ya existe' });
    }

    await db.query('INSERT INTO tags (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ mensaje: 'Tag creado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear tag' });
  }
};
