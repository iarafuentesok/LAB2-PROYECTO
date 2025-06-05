import express from 'express';
import {
  agregarComentario,
  obtenerComentariosPorImagen,
} from '../controllers/comentarios.controller.js';

const router = express.Router();

router.get('/imagen/:idImagen', obtenerComentariosPorImagen);
router.post('/imagen/:idImagen', agregarComentario);

export default router;
