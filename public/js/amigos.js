document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const resultadosBusqueda = document.getElementById('resultadosBusqueda');
  const solicitudesRecibidas = document.getElementById('solicitudesRecibidas');

  async function cargarSolicitudes() {
    try {
      const res = await fetch(`/api/amistad/pendientes/${usuario.id}`);
      const datos = await res.json();
      solicitudesRecibidas.innerHTML = '';
      datos.forEach((s) => {
        const li = document.createElement('li');
        li.innerHTML = `${s.remitente} <button data-id="${s.id}" class="aceptar">Aceptar</button> <button data-id="${s.id}" class="rechazar">Rechazar</button>`;
        solicitudesRecibidas.appendChild(li);
      });
    } catch (err) {
      console.error('Error al cargar solicitudes', err);
    }
  }

  solicitudesRecibidas.addEventListener('click', async (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const id = e.target.dataset.id;
    const acepta = e.target.classList.contains('aceptar');
    await fetch(`/api/amistad/responder/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acepta }),
    });
    cargarSolicitudes();
  });

  document.getElementById('buscarBtn').addEventListener('click', async () => {
    const texto = document.getElementById('busqueda').value.trim();
    if (!texto) return;
    try {
      const res = await fetch(`/api/usuarios/${texto}`); // se asume ID o texto de nombre
      if (!res.ok) {
        resultadosBusqueda.innerHTML = '<li>Usuario no encontrado</li>';
        return;
      }
      const usuarioEncontrado = await res.json();
      resultadosBusqueda.innerHTML = '';
      const li = document.createElement('li');
      li.innerHTML = `${usuarioEncontrado.nombre} <button id="solicitarBtn">Enviar solicitud</button>`;
      li.dataset.dest = usuarioEncontrado.id;
      resultadosBusqueda.appendChild(li);
    } catch (err) {
      console.error('Error en búsqueda', err);
    }
  });

  resultadosBusqueda.addEventListener('click', async (e) => {
    if (e.target.id !== 'solicitarBtn') return;
    const dest = e.target.parentElement.dataset.dest;
    await fetch('/api/amistad/solicitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_remitente: usuario.id, id_destinatario: dest }),
    });
    e.target.disabled = true;
    e.target.textContent = 'Enviada';
  });

  cargarSolicitudes();
});
