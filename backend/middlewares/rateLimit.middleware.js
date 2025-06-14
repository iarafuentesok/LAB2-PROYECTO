// backend/middlewares/rateLimit.middleware.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { mensaje: 'Demasiados intentos, inténtalo más tarde.' },
});

export const registroLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { mensaje: 'Demasiados registros, inténtalo más tarde.' },
});
