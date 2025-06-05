import express from 'express';
import { obtenerNotificaciones, marcarLeida } from '../controllers/notificaciones.controller.js';

const router = express.Router();

router.get('/:idUsuario', obtenerNotificaciones);
router.post('/:idNotificacion/leida', marcarLeida);

export default router;
