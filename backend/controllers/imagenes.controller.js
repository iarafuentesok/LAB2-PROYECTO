import { db } from "../db.js";

export const obtenerImagenesPorUsuario = async (req, res) => {
  try {
    const id_usuario = req.params.id;

    const [imagenes] = await db.query(
      `SELECT 
        id, id_album, url_archivo, visibilidad, descripcion, fecha_subida,
        destinatarios, seguidores
       FROM imagenes
       WHERE id_usuario = ?`,
      [id_usuario]
    );

    const convertidas = imagenes.map((img) => ({
      ...img,
      destinatarios: img.destinatarios ? JSON.parse(img.destinatarios) : [],
      seguidores: img.seguidores ? JSON.parse(img.seguidores) : [],
    }));

    res.json(convertidas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener las imágenes" });
  }
};
