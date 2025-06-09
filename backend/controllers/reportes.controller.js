import { db } from '../db.js';

export const crearReporte = async (req, res) => {
  try {
    const { id_usuario, id_contenido, tipo_contenido, motivo } = req.body;
    if (!id_usuario || !id_contenido || !tipo_contenido || !motivo) {
      return res.status(400).json({ mensaje: 'Faltan datos' });
    }

    const tiposPermitidos = ['imagen', 'comentario']; // opcional
    if (!tiposPermitidos.includes(tipo_contenido)) {
      return res.status(400).json({ mensaje: 'Tipo de contenido inválido' });
    }

    await db.query(
      'INSERT INTO reportes (id_usuario, id_contenido, tipo_contenido, motivo) VALUES (?, ?, ?, ?)',
      [id_usuario, id_contenido, tipo_contenido, motivo]
    );
    res.status(201).json({ mensaje: 'Reporte enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear reporte' });
  }
};
