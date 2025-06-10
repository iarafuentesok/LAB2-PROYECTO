import express from 'express';
import {
  obtenerImagenesPorUsuario,
  obtenerImagenesPublicas,
} from '../controllers/imagenes.controller.js';

const router = express.Router();

router.get('/usuario/:id', obtenerImagenesPorUsuario);
router.get('/publicas', obtenerImagenesPublicas);
export default router;
