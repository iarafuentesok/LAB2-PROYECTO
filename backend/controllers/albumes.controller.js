import { db } from "../db.js";
import multer from "multer";
import path from "path";

// Configuración de multer para guardar imágenes en /public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const nombreFinal = Date.now() + "-" + file.originalname;
    cb(null, nombreFinal);
  },
});
export const upload = multer({ storage });

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
          "SELECT * FROM imagenes WHERE id_album = ?",
          [album.id]
        );

        const convertidas = imagenes.map((img) => ({
          ...img,
          destinatarios: img.destinatarios ? JSON.parse(img.destinatarios) : [],
          seguidores: img.seguidores ? JSON.parse(img.seguidores) : [],
        }));

        return { ...album, imagenes: convertidas };
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
    const { id_album } = req.params;
    const { descripcion, visibilidad, destinatarios, seguidores, id_usuario } =
      req.body;

    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ mensaje: "No se recibió la imagen." });
    }

    const url_archivo = `/uploads/${archivo.filename}`;

    await db.query(
      `INSERT INTO imagenes 
        (id_album, url_archivo, descripcion, visibilidad, destinatarios, seguidores, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id_album,
        url_archivo,
        descripcion || "",
        visibilidad,
        destinatarios || "[]",
        seguidores || "[]",
        id_usuario,
      ]
    );

    res
      .status(201)
      .json({ mensaje: "Imagen subida correctamente", url_archivo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al subir imagen" });
  }
};
