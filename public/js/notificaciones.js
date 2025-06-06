function obtenerUsuarioActual() {
  try {
    const data = localStorage.getItem('usuarioActual');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const lista = document.getElementById('listaNotificaciones');

  const socket = io();
  socket.emit('registrar', usuario.id);
  socket.on('notificacion', (notif) => {
    mostrarNotificacion(notif);
  });

  async function cargar() {
    const res = await fetch(`/api/notificaciones/${usuario.id}`);
    const datos = await res.json();
    lista.innerHTML = '';
    datos.forEach((n) => mostrarNotificacion(n));
  }

  async function marcarLeida(id) {
    await fetch(`/api/notificaciones/${id}/leida`, { method: 'POST' });
  }

  function mostrarNotificacion(n) {
    const li = document.createElement('li');
    li.textContent = n.mensaje;
    if (n.url) {
      const a = document.createElement('a');
      a.href = n.url;
      a.textContent = ' Ver';
      li.appendChild(a);
    }
    if (!n.leido) {
      li.classList.add('no-leido');
    }
    li.addEventListener('click', () => {
      li.classList.remove('no-leido');
      marcarLeida(n.id);
    });
    lista.prepend(li);
  }

  cargar();
});
