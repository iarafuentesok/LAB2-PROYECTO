import assert from 'assert';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

assert.ok(process.env.DB_HOST, 'DB_HOST no definido');
assert.ok(process.env.DB_USER, 'DB_USER no definido');
assert.ok(process.env.DB_NAME, 'DB_NAME no definido');

console.log('✅ Variables de entorno cargadas correctamente');
