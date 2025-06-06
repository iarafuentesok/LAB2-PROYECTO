// backend/socket.js
import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // Permití todas las conexiones (ajustá esto en producción)
    },
  });

  io.on('connection', (socket) => {
    // El usuario se registra con su ID al conectarse
    socket.on('registrar', (userId) => {
      if (userId) {
        socket.join(String(userId)); // Lo unimos a una "sala" con su ID
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io no inicializado');
  }
  return io;
}
