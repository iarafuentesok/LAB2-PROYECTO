// backend/middlewares/upload.middleware.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// ✅ Ruta correcta a la carpeta public/uploads (la que sirve Express)
const uploadsDir = path.resolve('../public/uploads');

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
