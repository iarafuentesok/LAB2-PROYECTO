async function obtenerUsuario() {
  try {
    const res = await fetch('/api/usuarios/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.getElementById('navPublico');
  const usuario = await obtenerUsuario();
  const ruta = window.location.pathname;

  if (!nav) return;

  const mostrarNavPublico = () => {
    nav.innerHTML = `
      <a href="index.html">Inicio</a>
      <a href="portafolio.html">Portafolio</a>
      <a href="login.html">Iniciar Sesión</a>
      <a href="registro.html">Registrarse</a>
    `;
  };

  const mostrarNavPrivado = () => {
    nav.innerHTML = `
    <a href="inicio.html">Inicio</a>
    <a href="perfil.html">Perfil</a>
    <a href="albumes.html">Álbumes</a>
    <a href="amigos.html">Amigos</a>
    <a href="eventos.html">Eventos</a>
    <a href="notificaciones.html">Notificaciones<span id="notifCounter" class="badge" style="display:none"></span></a>
    <a href="portafolio.html">Portafolio</a>
    <a href="#" id="logoutBtn">Cerrar sesión</a>
  `;
  };

  // NAV lógico por sesión
  if (usuario) {
    mostrarNavPrivado();
    initNotificaciones();
  } else {
    mostrarNavPublico();
  }

  // Marcar ruta activa
  document.querySelectorAll('nav a').forEach((link) => {
    if (ruta.includes(link.getAttribute('href'))) {
      link.classList.add('activo');
    }
  });

  // Logout
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'logoutBtn') {
      e.preventDefault();
      await fetch('/api/usuarios/logout', { method: 'POST' });
      window.location.href = 'index.html';
    }
  });

  function initNotificaciones() {
    const badge = document.getElementById('notifCounter');
    if (!badge) return;
    let conteo = 0;

    function actualizar(n) {
      conteo = n;
      if (conteo > 0) {
        badge.textContent = conteo;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    window.actualizarNotifCounter = actualizar;

    async function cargarConteo() {
      try {
        const res = await fetch(`/api/notificaciones/${usuario.id}`);
        const datos = await res.json();
        const sinLeer = datos.filter((n) => !n.leido).length;
        actualizar(sinLeer);
      } catch (err) {
        console.error(err);
      }
    }

    function conectar() {
      const socket = io();
      socket.emit('registrar', usuario.id);
      socket.on('notificacion', () => {
        actualizar(conteo + 1);
      });
    }

    if (typeof io === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
      s.onload = () => {
        conectar();
        cargarConteo();
      };
      document.head.appendChild(s);
    } else {
      conectar();
      cargarConteo();
    }
  }
});
