import express from 'express';
import {
  obtenerImagenesPorUsuario,
  obtenerImagenesPublicas,
  obtenerImagenPorId,
} from '../controllers/imagenes.controller.js';

const router = express.Router();

router.get('/usuario/:id', obtenerImagenesPorUsuario);
router.get('/publicas', obtenerImagenesPublicas);
router.get('/:id', obtenerImagenPorId);
export default router;
