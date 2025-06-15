async function obtenerUsuarioActual() {
  try {
    const res = await fetch('/api/usuarios/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const lista = document.getElementById('listaNotificaciones');
  const socket = io();
  socket.emit('registrar', usuario.id);

  let contador = 0;

  socket.on('notificacion', (notif) => {
    mostrarNotificacion(notif);
    if (window.actualizarNotifCounter) {
      window.actualizarNotifCounter(contador + 1);
    }
  });

  async function cargar() {
    const res = await fetch(`/api/notificaciones/${usuario.id}`);
    const datos = await res.json();
    lista.innerHTML = '';
    datos.forEach((n) => mostrarNotificacion(n));
    contador = datos.filter((n) => !n.leido).length;
    if (window.actualizarNotifCounter) {
      window.actualizarNotifCounter(contador);
    }
  }

  async function marcarLeida(id) {
    await fetch(`/api/notificaciones/${id}/leida`, { method: 'POST' });
    if (contador > 0) {
      contador -= 1;
      if (window.actualizarNotifCounter) {
        window.actualizarNotifCounter(contador);
      }
    }
  }

  function mostrarNotificacion(n) {
    const li = document.createElement('li');
    li.textContent = n.mensaje;
    if (n.url && n.tipo !== 'amistad') {
      const a = document.createElement('a');
      a.href = n.url;
      a.textContent = ' Ver';
      li.appendChild(a);
    }

    if (n.tipo === 'amistad' && n.url && n.url.startsWith('/solicitud/')) {
      const idSol = n.url.split('/').pop();
      const aceptar = document.createElement('button');
      aceptar.textContent = 'Aceptar';
      const rechazar = document.createElement('button');
      rechazar.textContent = 'Rechazar';
      aceptar.addEventListener('click', async (e) => {
        e.stopPropagation();
        await fetch(`/api/amistad/responder/${idSol}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acepta: true }),
        });
        li.remove();
        marcarLeida(n.id);
      });
      rechazar.addEventListener('click', async (e) => {
        e.stopPropagation();
        await fetch(`/api/amistad/responder/${idSol}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acepta: false }),
        });
        li.remove();
        marcarLeida(n.id);
      });
      li.appendChild(aceptar);
      li.appendChild(rechazar);
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
