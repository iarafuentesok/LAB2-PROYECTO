// backend/routes/usuarios.routes.js
import express from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarioPorId,
  actualizarPerfil,
  cambiarPassword,
  obtenerUsuarioSesion,
  logoutUsuario,
} from '../controllers/usuarios.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { loginLimiter, registroLimiter } from '../middlewares/rateLimit.middleware.js';
const router = express.Router();

router.post('/registro', registroLimiter, registrarUsuario);
router.post('/login', loginLimiter, loginUsuario);
router.post('/logout', logoutUsuario);
router.get('/me', obtenerUsuarioSesion);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', upload.single('imagen'), actualizarPerfil);
router.put('/:id/password', cambiarPassword);
export default router;
