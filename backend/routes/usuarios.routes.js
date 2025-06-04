// backend/routes/usuarios.routes.js
import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarioPorId,
} from "../controllers/usuarios.controller.js";

const router = express.Router();

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.get("/:id", obtenerUsuarioPorId);

export default router;
