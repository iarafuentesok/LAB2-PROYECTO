import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutasPath = path.join(__dirname, '../routes/albumes.routes.js');
const contenido = fs.readFileSync(rutasPath, 'utf8');

assert.ok(contenido.includes('/imagen/:id_album'), 'La ruta de subida de imagen debe usar :id_album');

console.log('✅ Ruta de subida de imagen verificada');
