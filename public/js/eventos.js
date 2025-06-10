document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const eventoForm = document.getElementById('eventoForm');
  const listaEventos = document.getElementById('listaEventos');
  const mensaje = document.getElementById('mensajeEvento');
  let eventos = [];

  async function cargarEventos() {
    try {
      const res = await fetch('/api/eventos');
      eventos = await res.json();
      renderEventos();
    } catch (err) {
      console.error('Error al cargar eventos', err);
    }
  }

  function renderEventos() {
    listaEventos.innerHTML = '';
    eventos.forEach((ev) => {
      const div = document.createElement('div');
      div.classList.add('evento');
      div.innerHTML = `
        <h3>${ev.titulo}</h3>
        <p><strong>Fecha:</strong> ${ev.fecha_evento}</p>
        <p>${ev.descripcion || ''}</p>
        <button disabled>Inscribirse (próximamente)</button>
      `;
      listaEventos.appendChild(div);
    });
  }

  eventoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const fecha = document.getElementById('fecha').value;
    if (!titulo || !fecha) return;

    const res = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: usuario.id, titulo, descripcion, fecha_evento: fecha }),
    });

    if (res.ok) {
      if (mensaje) mensaje.textContent = '✅ Evento creado.';
      await cargarEventos();
      eventoForm.reset();
    } else if (mensaje) {
      mensaje.textContent = '❌ Error al crear evento';
    }
    if (mensaje) setTimeout(() => (mensaje.textContent = ''), 3000);
  });

  await cargarEventos();
});
