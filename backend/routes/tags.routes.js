import express from 'express';
import { obtenerTags, crearTag } from '../controllers/tags.controller.js';

const router = express.Router();

router.get('/', obtenerTags);
router.post('/', crearTag);

export default router;
