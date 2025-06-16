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
  const params = new URLSearchParams(window.location.search);
  const perfilId = params.get('usuario_id');
  const imagenParam = params.get('img');
  const visitante = await obtenerUsuario();

  if (!visitante) {
    window.location.href = 'login.html';
    return;
  }

  const idVisitante = visitante.id;
  const idPerfil = perfilId || idVisitante;
  const esMiPerfil = parseInt(idPerfil) === parseInt(idVisitante);

  try {
    // Obtener datos del perfil
    const res = await fetch(`http://localhost:3000/api/usuarios/${idPerfil}`);
    const perfil = await res.json();

    if (!perfil) {
      document.body.innerHTML = '<p>Perfil no encontrado.</p>';
      return;
    }

    // Mostrar datos personales
    const imgPerfil = perfil.imagen_perfil
      ? `/assets/${perfil.imagen_perfil}`
      : '/assets/default-profile.png';
    document.getElementById('nombrePerfil').textContent = perfil.nombre;
    document.getElementById('imagenPerfil').src = imgPerfil;
    document.getElementById('intereses').textContent = `🎨 Intereses: ${
      perfil.intereses || 'Sin datos'
    }`;
    document.getElementById('antecedentes').textContent = `📜 Antecedentes: ${
      perfil.antecedentes || 'Sin datos'
    }`;

    if (esMiPerfil) {
      document.getElementById('accionesPropias').style.display = 'block';
      document.getElementById('crearAlbumBtn').addEventListener('click', () => {
        window.location.href = 'albumes.html';
      });
    }

    // IMÁGENES DESTACADAS
    const galeria = document.getElementById('galeriaObras');
    galeria.innerHTML = '';

    const resImgs = await fetch(`http://localhost:3000/api/imagenes/usuario/${idPerfil}`);
    const imagenes = await resImgs.json();

    const visibles = imagenes
      .filter((img) => puedeVerImagen(img, idVisitante, esMiPerfil))
      .slice(0, 3);

    if (visibles.length === 0) {
      galeria.innerHTML = '<p>No hay imágenes destacadas disponibles.</p>';
    } else {
      visibles.forEach((img) => {
        const div = document.createElement('div');
        div.classList.add('obra-publica');
        div.innerHTML = `
          <img src="${img.url_archivo}" data-id="${img.id}" alt="${img.descripcion || ''}">
          ${img.descripcion ? `<p>${img.descripcion}</p>` : ''}
        `;
        div.querySelector('img').addEventListener('click', async () => {
          imagenActual = img.id;
          document.getElementById('lightboxImagen').src = img.url_archivo;
          document.getElementById('lightboxTitulo').textContent = img.descripcion || '';
          document.getElementById('lightboxDescripcion').textContent = '';
          document.getElementById('lightbox').style.display = 'flex';
          await cargarComentarios(imagenActual);
        });
        galeria.appendChild(div);
      });
    }

    // ÁLBUMES
    const albumesContenedor = document.getElementById('listaAlbumes');
    albumesContenedor.innerHTML = '';

    const resAlbumes = await fetch(`http://localhost:3000/api/albumes/usuario/${idPerfil}`);
    const albumes = await resAlbumes.json();

    if (albumes.length === 0) {
      albumesContenedor.innerHTML = '<p>Este usuario aún no tiene álbumes públicos.</p>';
    } else {
      albumes.forEach((album) => {
        const div = document.createElement('div');
        div.classList.add('album');

        const imagenesVisibles = (album.imagenes || []).filter((img) =>
          puedeVerImagen(img, idVisitante, esMiPerfil)
        );

        const imagenesHTML = imagenesVisibles
          .map(
            (img) => `
              <div class="imagen-album">
                 <img src="${img.url_archivo}" data-id="${img.id}" alt="${img.descripcion || ''}">
                ${img.descripcion ? `<p>${img.descripcion}</p>` : ''}
              </div>
            `
          )
          .join('');

        div.innerHTML = `
          <h4>${album.titulo}</h4>
          <div class="imagenes-album">${imagenesHTML}</div>
        `;

        albumesContenedor.appendChild(div);
      });
    }

    // LIGHTBOX
    let imagenActual = null;

    async function cargarComentarios(idImagen) {
      try {
        const res = await fetch(`/api/comentarios/imagen/${idImagen}`);
        const comentarios = await res.json();
        const lista = document.getElementById('listaComentarios');
        lista.innerHTML = '';
        comentarios.forEach((c) => {
          const li = document.createElement('li');
          li.textContent = `${c.nombre}: ${c.comentario}`;
          lista.appendChild(li);
        });
      } catch (e) {
        console.error('Error comentarios', e);
      }
    }

    document.getElementById('formComentario').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!imagenActual) return;
      const texto = document.getElementById('comentario').value.trim();
      if (!texto) return;
      const resp = await fetch(`/api/comentarios/imagen/${imagenActual}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: visitante.id, comentario: texto }),
      });
      if (resp.ok) {
        document.getElementById('comentario').value = '';
        await cargarComentarios(imagenActual);
      }
    });

    document.getElementById('cerrarLightbox').addEventListener('click', () => {
      document.getElementById('lightbox').style.display = 'none';
    });

    document.querySelectorAll('.imagenes-album img').forEach((img) => {
      img.addEventListener('click', async () => {
        imagenActual = img.dataset.id;
        document.getElementById('lightboxImagen').src = img.src;
        document.getElementById('lightboxTitulo').textContent = img.alt || '';
        document.getElementById('lightboxDescripcion').textContent = '';
        document.getElementById('lightbox').style.display = 'flex';
        await cargarComentarios(imagenActual);
      });
    });

    if (imagenParam) {
      const imgEl = document.querySelector(`img[data-id="${imagenParam}"]`);
      if (imgEl) {
        imgEl.click();
      } else {
        try {
          const resImg = await fetch(`/api/imagenes/${imagenParam}`);
          if (resImg.ok) {
            const imgData = await resImg.json();
            if (puedeVerImagen(imgData, idVisitante, esMiPerfil)) {
              imagenActual = imgData.id;
              document.getElementById('lightboxImagen').src = imgData.url_archivo;
              document.getElementById('lightboxTitulo').textContent = imgData.descripcion || '';
              document.getElementById('lightboxDescripcion').textContent = '';
              document.getElementById('lightbox').style.display = 'flex';
              await cargarComentarios(imagenActual);
            }
          }
        } catch (e) {
          console.error('Error al cargar imagen por parámetro', e);
        }
      }
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/usuarios/logout', { method: 'POST' });
        window.location.href = 'index.html';
      });
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    document.body.innerHTML = '<p>Error al cargar el perfil.</p>';
  }
});

function puedeVerImagen(imagen, visitanteId, esMiPerfil) {
  if (esMiPerfil) return true;
  if (imagen.visibilidad === 'publica') return true;
  if (imagen.visibilidad === 'privada' || imagen.visibilidad === 'privada_todos') {
    return Array.isArray(imagen.seguidores) && imagen.seguidores.includes(visitanteId);
  }
  if (imagen.visibilidad === 'compartida' || imagen.visibilidad === 'privada_select') {
    return Array.isArray(imagen.destinatarios) && imagen.destinatarios.includes(visitanteId);
  }
  return false;
}
