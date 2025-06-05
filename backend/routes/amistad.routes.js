import express from 'express';
import {
  enviarSolicitud,
  responderSolicitud,
  solicitudesPendientes,
} from '../controllers/amistad.controller.js';

const router = express.Router();

router.post('/solicitar', enviarSolicitud);
router.post('/responder/:idSolicitud', responderSolicitud);
router.get('/pendientes/:idUsuario', solicitudesPendientes);

export default router;
