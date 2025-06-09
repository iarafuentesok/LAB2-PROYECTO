import { db } from '../db.js';

// Obtener imágenes subidas por un usuario específico
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

        const [tagRows] = await db.query(
          `SELECT t.nombre FROM imagenes_tags it JOIN tags t ON it.id_tag = t.id WHERE it.id_imagen = ?`,
          [img.id]
        );
        const tags = tagRows.map((t) => t.nombre);

        return { ...img, destinatarios, tags };
      })
    );

    res.json(withRecipients);
  } catch (error) {
    console.error('Error al obtener las imágenes del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener las imágenes' });
  }
};
