import express from 'express';
import {
  obtenerEventos,
  crearEvento,
  inscribirseEvento,
  obtenerInscripciones,
} from '../controllers/eventos.controller.js';

const router = express.Router();

router.get('/', obtenerEventos);
router.post('/', crearEvento);
router.post('/:idEvento/inscribirse', inscribirseEvento);
router.get('/:idEvento/inscripciones', obtenerInscripciones);

export default router;
