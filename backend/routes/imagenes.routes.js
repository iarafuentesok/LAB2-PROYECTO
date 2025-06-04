import express from "express";
import { obtenerImagenesPorUsuario } from "../controllers/imagenes.controller.js";

const router = express.Router();

router.get("/usuario/:id", obtenerImagenesPorUsuario);

export default router;
