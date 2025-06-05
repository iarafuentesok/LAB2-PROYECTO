import { db } from "../db.js";

// Obtener álbumes con imágenes
export const obtenerAlbumesPorUsuario = async (req, res) => {
  try {
    const id_usuario = req.params.id;

    const [albumes] = await db.query(
      "SELECT id, titulo, fecha_creacion FROM albumes WHERE id_usuario = ?",
      [id_usuario]
    );

    const albumesConImagenes = await Promise.all(
      albumes.map(async (album) => {
        const [imagenes] = await db.query(
          "SELECT id, id_album, id_usuario, url_archivo, descripcion, visibilidad, fecha_subida FROM imagenes WHERE id_album = ?",
          [album.id]
        );

        const withRecipients = await Promise.all(
          imagenes.map(async (img) => {
            const [rows] = await db.query(
              "SELECT id_usuario FROM imagenes_compartidas WHERE id_imagen = ?",
              [img.id]
            );
            const destinatarios = rows.map((r) => r.id_usuario);
            return { ...img, destinatarios };
          })
        );

        return { ...album, imagenes: withRecipients };
      })
    );

    res.json(albumesConImagenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener los álbumes" });
  }
};

// Crear álbum
export const crearAlbum = async (req, res) => {
  try {
    const { titulo, id_usuario } = req.body;
    await db.query("INSERT INTO albumes (titulo, id_usuario) VALUES (?, ?)", [
      titulo,
      id_usuario,
    ]);
    res.status(201).json({ mensaje: "Álbum creado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear el álbum" });
  }
};

// Subir imagen a álbum
export const subirImagen = async (req, res) => {
  try {
    const { albumId } = req.params;
    const {
      descripcion,
      visibilidad,
      destinatarios = [],
      id_usuario,
    } = req.body;

    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ mensaje: "No se recibió la imagen." });
    }

    const url_archivo = `/uploads/${archivo.filename}`;

    const [result] = await db.query(
      `INSERT INTO imagenes (id_album, id_usuario, url_archivo, descripcion, visibilidad)
       VALUES (?, ?, ?, ?, ?)`,
      [albumId, id_usuario, url_archivo, descripcion || "", visibilidad]
    );

    if (visibilidad === "compartida" && Array.isArray(destinatarios)) {
      const values = destinatarios.map((uid) => [result.insertId, uid]);
      if (values.length > 0) {
        await db.query(
          "INSERT INTO imagenes_compartidas (id_imagen, id_usuario) VALUES ?",
          [values]
        );
      }
    }

    res
      .status(201)
      .json({ mensaje: "Imagen subida correctamente", url_archivo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al subir imagen" });
  }
};
