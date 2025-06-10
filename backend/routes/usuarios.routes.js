// backend/routes/usuarios.routes.js
import express from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarioPorId,
  actualizarPerfil,
  cambiarPassword,
} from '../controllers/usuarios.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
const router = express.Router();

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', upload.single('imagen'), actualizarUsuario);
router.put('/:id/password', cambiarPassword);
export default router;
