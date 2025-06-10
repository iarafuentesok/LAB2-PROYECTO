document.addEventListener('DOMContentLoaded', async () => {
  const galeria = document.getElementById('galeriaPublica');
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  try {
    const res = await fetch('/api/imagenes/publicas');
    const imagenes = await res.json();
    if (imagenes.length === 0) {
      galeria.innerHTML = '<p>No hay obras públicas disponibles por el momento.</p>';
      return;
    }

    imagenes.forEach((obra) => {
      const div = document.createElement('div');
      div.classList.add('obra-publica');
      div.innerHTML = `
        <img src="${obra.url_archivo}" alt="${obra.descripcion || ''}">
        <p class="titulo-obra">${obra.descripcion || ''}</p>
        <p class="autor-obra">
          por <a href="${usuario ? `perfil.html?usuario_id=${obra.id_usuario}` : 'login.html'}">
            ${obra.autor}
          </a>
        </p>`;
      galeria.appendChild(div);
    });
  } catch (err) {
    console.error('Error al cargar portafolio', err);
    galeria.innerHTML = '<p>Error al cargar obras públicas.</p>';
  }
});
