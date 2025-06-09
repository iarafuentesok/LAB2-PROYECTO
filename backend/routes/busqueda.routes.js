import express from 'express';
import { busquedaGeneral } from '../controllers/busqueda.controller.js';

const router = express.Router();

router.get('/', busquedaGeneral);

export default router;
