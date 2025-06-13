// backend/middlewares/upload.middleware.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Determinar ruta absoluta a la carpeta public/uploads sin depender del cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Guarda en public/uploads
  },
  filename: (req, file, cb) => {
    const nombreFinal = Date.now() + '-' + file.originalname;
    cb(null, nombreFinal);
  },
});

export const upload = multer({ storage });
