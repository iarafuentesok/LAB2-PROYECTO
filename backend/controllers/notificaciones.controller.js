import { db } from '../db.js';

export const obtenerNotificaciones = async (req, res) => {
  try {
    const id_usuario = req.params.idUsuario;
    const [rows] = await db.query(
      'SELECT id, tipo, mensaje, url, leido, fecha FROM notificaciones WHERE id_usuario = ? ORDER BY fecha DESC',
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
  }
};

export const marcarLeida = async (req, res) => {
  try {
    const id_notificacion = req.params.idNotificacion;
    await db.query('UPDATE notificaciones SET leido = TRUE WHERE id = ?', [id_notificacion]);
    res.json({ mensaje: 'Notificación actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar' });
  }
};
