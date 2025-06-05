import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import usuariosRoutes from './routes/usuarios.routes.js';
import imagenesRoutes from './routes/imagenes.routes.js';
import albumesRoutes from './routes/albumes.routes.js';
import comentariosRoutes from './routes/comentarios.routes.js'; // 👈 nuevo
import amistadRoutes from './routes/amistad.routes.js'; // 👈 nuevo
import notificacionesRoutes from './routes/notificaciones.routes.js'; // 👈 nuevo

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

const app = express();

// 🛡 Seguridad básica
app.use(helmet());

// 🌐 CORS
app.use(cors());

// 📝 Logging de peticiones HTTP
app.use(morgan('dev'));

// 📦 Parseo JSON en requests
app.use(express.json());

// 🧩 Archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(publicPath));

// 🔗 Rutas de API REST
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/albumes', albumesRoutes);
app.use('/api/comentarios', comentariosRoutes); // 👈 nuevo
app.use('/api/amistad', amistadRoutes); // 👈 nuevo
app.use('/api/notificaciones', notificacionesRoutes); // 👈 nuevo

// 🔍 Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🎉');
});

// ❗ Middleware de errores internos
app.use((err, req, res, next) => {
  console.error('💥 Error inesperado:', err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// ❌ Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).send('Archivo no encontrado: ' + req.originalUrl);
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
console.log('Archivos estáticos servidos desde:', publicPath);
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
