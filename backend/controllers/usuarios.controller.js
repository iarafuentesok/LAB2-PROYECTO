import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { validarPasswordSegura } from '../utils/seguridad.js';

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    if (!validarPasswordSegura(password)) {
      return res.status(400).json({ mensaje: 'La contraseña no es lo suficientemente segura.' });
    }

    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (usuarios.length > 0) {
      return res.status(409).json({ mensaje: 'El email ya está registrado.' });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    await db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [
      nombre,
      email,
      passwordEncriptada,
    ]);

    res.status(201).json({ mensaje: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};

// Login usuario
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    req.session.usuarioId = usuario.id;
    res.status(200).json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        imagen_perfil: usuario.imagen_perfil,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

export const obtenerUsuarioSesion = async (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, imagen_perfil FROM usuarios WHERE id = ?',
      [req.session.usuarioId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
};

export const logoutUsuario = (req, res) => {
  req.session.destroy(() => {
    res.json({ mensaje: 'Sesión cerrada' });
  });
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query(
      'SELECT id, nombre, email, imagen_perfil, intereses, antecedentes FROM usuarios WHERE id = ?',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el perfil' });
  }
};

// Actualizar perfil (con imagen opcional)
export const actualizarPerfil = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, email, intereses, antecedentes, modo_vitrina } = req.body;

    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (email !== undefined) {
      campos.push('email = ?');
      valores.push(email);
    }
    if (intereses !== undefined) {
      campos.push('intereses = ?');
      valores.push(intereses);
    }
    if (antecedentes !== undefined) {
      campos.push('antecedentes = ?');
      valores.push(antecedentes);
    }
    if (modo_vitrina !== undefined) {
      campos.push('modo_vitrina = ?');
      valores.push(modo_vitrina);
    }
    if (req.file) {
      campos.push('imagen_perfil = ?');
      valores.push(`/uploads/${req.file.filename}`);
    }

    if (campos.length === 0) {
      return res.status(400).json({ mensaje: 'No hay datos para actualizar.' });
    }

    valores.push(id);

    await db.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);

    res.json({ mensaje: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el perfil' });
  }
};

// Cambiar contraseña
export const cambiarPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { password_actual, password_nuevo } = req.body;

    if (!password_actual || !password_nuevo) {
      return res.status(400).json({ mensaje: 'Faltan datos' });
    }

    if (!validarPasswordSegura(password_nuevo)) {
      return res.status(400).json({ mensaje: 'La nueva contraseña no cumple con los requisitos.' });
    }
    const [rows] = await db.query('SELECT password FROM usuarios WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const coincide = await bcrypt.compare(password_actual, rows[0].password);

    if (!coincide) {
      return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });
    }

    const nuevaEncriptada = await bcrypt.hash(password_nuevo, 10);

    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [nuevaEncriptada, id]);

    res.json({ mensaje: 'Contraseña actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar contraseña' });
  }
};

// Buscar usuarios por nombre o email
export const buscarUsuarios = async (req, res) => {
  const termino = req.query.q ? req.query.q.trim() : '';
  if (!termino) {
    return res.status(400).json({ mensaje: 'Se requiere un término de búsqueda' });
  }

  const idActual = req.session.usuarioId || 0;

  try {
    let query =
      'SELECT u.id, u.nombre, u.email, u.imagen_perfil, ' +
      'EXISTS(SELECT 1 FROM amistades a WHERE a.id_usuario = ? AND a.id_amigo = u.id) AS siguiendo, ' +
      "EXISTS(SELECT 1 FROM solicitudes_amistad s WHERE s.id_remitente = ? AND s.id_destinatario = u.id AND s.estado = 'pendiente') AS solicitud_pendiente " +
      'FROM usuarios u WHERE (u.nombre LIKE ? OR u.email LIKE ?)';

    const params = [idActual, idActual, `%${termino}%`, `%${termino}%`];

    query += ' ORDER BY u.nombre';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al buscar usuarios' });
  }
};
