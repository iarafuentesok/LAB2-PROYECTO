import { db } from '../db.js';
import { getIO } from '../socket.js';

// Enviar solicitud de amistad
export const enviarSolicitud = async (req, res) => {
  try {
    const { id_remitente, id_destinatario } = req.body;
    if (!id_remitente || !id_destinatario) {
      return res.status(400).json({ mensaje: 'Datos incompletos' });
    }

    const [existePendiente] = await db.query(
      'SELECT id FROM solicitudes_amistad WHERE id_remitente = ? AND id_destinatario = ? AND estado = "pendiente"',
      [id_remitente, id_destinatario]
    );
    if (existePendiente.length) {
      return res.status(409).json({ mensaje: 'Solicitud ya enviada' });
    }

    const [yaAmigos] = await db.query(
      'SELECT id FROM amistades WHERE id_usuario = ? AND id_amigo = ?',
      [id_remitente, id_destinatario]
    );
    if (yaAmigos.length) {
      return res.status(409).json({ mensaje: 'Ya son amigos' });
    }

    const [solRes] = await db.query(
      'INSERT INTO solicitudes_amistad (id_remitente, id_destinatario) VALUES (?, ?)',
      [id_remitente, id_destinatario]
    );
    const [[{ nombre: remitenteNombre }]] = await db.query(
      'SELECT nombre FROM usuarios WHERE id = ?',
      [id_remitente]
    );

    const mensaje = `Nueva solicitud de amistad de ${remitenteNombre}`;
    const [result] = await db.query(
      "INSERT INTO notificaciones (id_usuario, tipo, mensaje, url) VALUES (?, 'amistad', ?, ?)",
      [id_destinatario, mensaje, `/solicitud/${solRes.insertId}`]
    );

    // Notificación en tiempo real al destinatario
    getIO()
      .to(String(id_destinatario))
      .emit('notificacion', {
        id: result.insertId,
        tipo: 'amistad',
        mensaje,
        url: `/solicitud/${solRes.insertId}`,
        leido: 0,
      });

    res.status(201).json({ mensaje: 'Solicitud enviada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al enviar solicitud' });
  }
};

// Responder solicitud de amistad (aceptar o rechazar)
export const responderSolicitud = async (req, res) => {
  try {
    const id_solicitud = req.params.idSolicitud;
    const { acepta } = req.body;

    const [solRows] = await db.query('SELECT * FROM solicitudes_amistad WHERE id = ?', [
      id_solicitud,
    ]);
    if (!solRows.length) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    const solicitud = solRows[0];
    const estado = acepta ? 'aceptada' : 'rechazada';

    await db.query(
      'UPDATE solicitudes_amistad SET estado = ?, fecha_respuesta = NOW() WHERE id = ?',
      [estado, id_solicitud]
    );

    // Marcar la notificación original como leída para que desaparezca de la vista del destinatario
    await db.query('UPDATE notificaciones SET leido = TRUE WHERE id_usuario = ? AND url = ?', [
      solicitud.id_destinatario,
      `/solicitud/${id_solicitud}`,
    ]);

    if (acepta) {
      // Registrar seguimiento del remitente hacia el destinatario
      await db.query('INSERT INTO amistades (id_usuario, id_amigo) VALUES (?, ?)', [
        solicitud.id_remitente,
        solicitud.id_destinatario,
      ]);

      // Crear álbum en el remitente con el nombre del destinatario
      const [userRows] = await db.query('SELECT nombre FROM usuarios WHERE id = ?', [
        solicitud.id_destinatario,
      ]);
      if (userRows.length) {
        const nombre = userRows[0].nombre;
        await db.query('INSERT INTO albumes (id_usuario, titulo) VALUES (?, ?)', [
          solicitud.id_remitente,
          nombre,
        ]);
      }
    }

    const mensaje = acepta
      ? 'Tu solicitud de amistad fue aceptada'
      : 'Tu solicitud de amistad fue rechazada';

    const [notifRes] = await db.query(
      "INSERT INTO notificaciones (id_usuario, tipo, mensaje) VALUES (?, 'amistad', ?)",
      [solicitud.id_remitente, mensaje]
    );

    // Notificación en tiempo real al remitente
    getIO().to(String(solicitud.id_remitente)).emit('notificacion', {
      id: notifRes.insertId,
      tipo: 'amistad',
      mensaje,
      leido: 0,
    });

    res.json({ mensaje: 'Respuesta registrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al responder solicitud' });
  }
};

// Consultar solicitudes pendientes de amistad
export const solicitudesPendientes = async (req, res) => {
  try {
    const id_usuario = req.params.idUsuario;
    const [rows] = await db.query(
      `SELECT s.id, s.id_remitente, u.nombre AS remitente
       FROM solicitudes_amistad s
       JOIN usuarios u ON s.id_remitente = u.id
       WHERE s.id_destinatario = ? AND s.estado = 'pendiente'`,
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes' });
  }
};

// Obtener lista de amigos de un usuario
export const obtenerAmigos = async (req, res) => {
  try {
    const id_usuario = req.params.idUsuario;
    const [rows] = await db.query(
      `SELECT u.id, u.nombre
       FROM amistades a
              JOIN usuarios u ON u.id = a.id_amigo
       WHERE a.id_usuario = ?`,
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener amigos' });
  }
};
