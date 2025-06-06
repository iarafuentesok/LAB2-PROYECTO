import { db } from '../db.js';
import { getIO } from '../socket.js';

// Enviar solicitud de amistad
export const enviarSolicitud = async (req, res) => {
  try {
    const { id_remitente, id_destinatario } = req.body;
    if (!id_remitente || !id_destinatario) {
      return res.status(400).json({ mensaje: 'Datos incompletos' });
    }

    await db.query(
      'INSERT INTO solicitudes_amistad (id_remitente, id_destinatario) VALUES (?, ?)',
      [id_remitente, id_destinatario]
    );

    const [result] = await db.query(
      "INSERT INTO notificaciones (id_usuario, tipo, mensaje) VALUES (?, 'amistad', ?)",
      [id_destinatario, 'Nueva solicitud de amistad']
    );

    // Notificación en tiempo real al destinatario
    getIO().to(String(id_destinatario)).emit('notificacion', {
      id: result.insertId,
      tipo: 'amistad',
      mensaje: 'Nueva solicitud de amistad',
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

    if (acepta) {
      const id1 = Math.min(solicitud.id_remitente, solicitud.id_destinatario);
      const id2 = Math.max(solicitud.id_remitente, solicitud.id_destinatario);

      // Registrar la amistad
      await db.query('INSERT INTO amistades (id_usuario, id_amigo) VALUES (?, ?)', [id1, id2]);

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
