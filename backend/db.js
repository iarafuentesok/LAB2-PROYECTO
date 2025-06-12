// backend/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ruta absoluta al .env dentro de backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intenta cargar las variables de entorno desde backend/.env
// y como alternativa desde la raíz del proyecto
const envPathBackend = path.join(__dirname, '.env');
const envPathRoot = path.join(__dirname, '../.env');
dotenv.config({ path: envPathBackend });
dotenv.config({ path: envPathRoot, override: false });

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
