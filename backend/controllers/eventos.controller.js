import { db } from '../db.js';

export const obtenerEventos = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_usuario, titulo, descripcion, fecha_evento, lugar, fecha_publicacion FROM eventos ORDER BY fecha_evento DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener eventos' });
  }
};

export const crearEvento = async (req, res) => {
  try {
    const { id_usuario, titulo, descripcion, fecha_evento, lugar } = req.body;
    if (!id_usuario || !titulo || !fecha_evento) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }
    await db.query(
      'INSERT INTO eventos (id_usuario, titulo, descripcion, fecha_evento, lugar) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, descripcion || '', titulo, fecha_evento, lugar || '']
    );
    res.status(201).json({ mensaje: 'Evento creado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear evento' });
  }
};

export const inscribirseEvento = async (req, res) => {
  try {
    const id_evento = req.params.idEvento;
    const { id_usuario } = req.body;
    if (!id_usuario) {
      return res.status(400).json({ mensaje: 'Usuario requerido' });
    }

    const [yaInscripto] = await db.query(
      'SELECT id FROM inscripciones_evento WHERE id_evento = ? AND id_usuario = ?',
      [id_evento, id_usuario]
    );
    if (yaInscripto.length > 0) {
      return res.status(400).json({ mensaje: 'Ya estás inscripto en este evento' });
    }

    await db.query('INSERT INTO inscripciones_evento (id_evento, id_usuario) VALUES (?, ?)', [
      id_evento,
      id_usuario,
    ]);
    res.status(201).json({ mensaje: 'Inscripción registrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al inscribirse' });
  }
};

export const obtenerInscripciones = async (req, res) => {
  try {
    const id_evento = req.params.idEvento;
    const [rows] = await db.query(
      'SELECT id, id_usuario, fecha_inscripcion FROM inscripciones_evento WHERE id_evento = ?',
      [id_evento]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener inscripciones' });
  }
};
