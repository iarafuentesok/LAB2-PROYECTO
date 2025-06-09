import { db } from '../db.js';

export const busquedaGeneral = async (req, res) => {
  const termino = req.query.q ? req.query.q.trim() : '';
  const tagsParam = req.query.tags || '';
  const tagList = tagsParam
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t);

  try {
    let usuarios = [];
    if (termino) {
      const [rows] = await db.query(
        'SELECT id, nombre FROM usuarios WHERE nombre LIKE ? ORDER BY nombre',
        [`%${termino}%`]
      );
      usuarios = rows;
    }

    let albumes = [];
    if (termino) {
      const [rows] = await db.query(
        `SELECT a.id, a.titulo, a.id_usuario, u.nombre AS autor
         FROM albumes a
         JOIN usuarios u ON a.id_usuario = u.id
         WHERE a.titulo LIKE ?`,
        [`%${termino}%`]
      );
      albumes = rows;
    }

    let imagenesQuery = 'SELECT i.id, i.descripcion, i.url_archivo, i.id_album FROM imagenes i';
    const params = [];
    const condiciones = [];

    if (termino) {
      condiciones.push('i.descripcion LIKE ?');
      params.push(`%${termino}%`);
    }

    if (tagList.length) {
      const placeholders = tagList.map(() => '?').join(',');
      condiciones.push(
        `i.id IN (SELECT it.id_imagen FROM imagenes_tags it JOIN tags t ON it.id_tag = t.id WHERE t.nombre IN (${placeholders}))`
      );
      params.push(...tagList);
    }

    if (condiciones.length) {
      imagenesQuery += ' WHERE ' + condiciones.join(' AND ');
    }

    const [imagenes] = await db.query(imagenesQuery, params);

    res.json({ usuarios, albumes, imagenes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en la búsqueda' });
  }
};
