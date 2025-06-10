import { db } from '../db.js';

export const obtenerImagenesPorUsuario = async (req, res) => {
  try {
    const id_usuario = req.params.id;

    const [imagenes] = await db.query(
      `SELECT id, id_album, id_usuario, url_archivo, visibilidad, descripcion, fecha_subida
       FROM imagenes WHERE id_usuario = ?`,
      [id_usuario]
    );

    const withRecipients = await Promise.all(
      imagenes.map(async (img) => {
        const [rows] = await db.query(
          'SELECT id_usuario FROM imagenes_compartidas WHERE id_imagen = ?',
          [img.id]
        );
        const destinatarios = rows.map((r) => r.id_usuario);
        return { ...img, destinatarios };
      })
    );

    res.json(withRecipients);
  } catch (error) {
    console.error('Error al obtener las imágenes del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener las imágenes' });
  }
};

// Obtener todas las imágenes públicas con datos de autor
export const obtenerImagenesPublicas = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.id_usuario, i.url_archivo, i.descripcion, i.fecha_subida, u.nombre AS autor
       FROM imagenes i JOIN usuarios u ON i.id_usuario = u.id
       WHERE i.visibilidad = 'publica'
       ORDER BY i.fecha_subida DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener imágenes públicas:', error);
    res.status(500).json({ mensaje: 'Error al obtener imágenes públicas' });
  }
};
