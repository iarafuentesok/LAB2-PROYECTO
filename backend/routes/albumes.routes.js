// backend/routes/albumes.routes.js
import express from "express";
import {
  obtenerAlbumesPorUsuario,
  crearAlbum,
  subirImagen,
} from "../controllers/albumes.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/usuario/:id", obtenerAlbumesPorUsuario);
router.post("/crear", crearAlbum);
router.post(
  "/imagen/:id_album",
  upload.single("imagen"),
  subirImagen
); // Ruta para subir una imagen a un álbum

export default router;
