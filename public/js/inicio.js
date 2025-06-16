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
  const feed = document.getElementById('feed');
  const usuario = await obtenerUsuario();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const publicaciones = [];

  try {
    const resAmigos = await fetch(`/api/amistad/amigos/${usuario.id}`);
    const amigos = await resAmigos.json();

    for (const amigo of amigos) {
      const resImg = await fetch(`/api/imagenes/usuario/${amigo.id}`);
      const imagenes = await resImg.json();

      imagenes.forEach((img) => {
        if (
          img.visibilidad === 'publica' ||
          img.visibilidad === 'privada' ||
          (img.visibilidad === 'compartida' && img.destinatarios.includes(usuario.id))
        ) {
          publicaciones.push({
            id: img.id,
            autor: amigo.nombre,
            usuario_id: amigo.id,
            titulo: img.descripcion || '',
            url: img.url_archivo,
            fecha: img.fecha_subida,
          });
        }
      });
    }

    if (publicaciones.length === 0) {
      feed.innerHTML = '<p>Tus contactos aún no compartieron obras públicas.</p>';
      return;
    }

    publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    publicaciones.forEach((pub) => {
      const fechaFormateada = new Date(pub.fecha).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const div = document.createElement('div');
      div.classList.add('obra-publica');
      div.innerHTML = `
        <img src="${pub.url}" data-id="${pub.id}" alt="${pub.titulo}">
        <p><strong>${pub.titulo}</strong></p>
        <p>por <a href="perfil.html?usuario_id=${pub.usuario_id}">${pub.autor}</a></p>
        <p class="fecha-publicacion">📅 Publicado el ${fechaFormateada}</p>`;
      feed.appendChild(div);
    });

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
        body: JSON.stringify({ id_usuario: usuario.id, comentario: texto }),
      });
      if (resp.ok) {
        document.getElementById('comentario').value = '';
        await cargarComentarios(imagenActual);
      }
    });

    const lightbox = document.getElementById('lightbox');
    const cerrarBtn = document.getElementById('cerrarLightbox');

    function cerrarLightbox() {
      lightbox.style.display = 'none';
    }

    cerrarBtn.addEventListener('click', cerrarLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) cerrarLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarLightbox();
    });

    document.querySelectorAll('.obra-publica img').forEach((img) => {
      img.addEventListener('click', async () => {
        imagenActual = img.dataset.id;
        document.getElementById('lightboxImagen').src = img.src;
        document.getElementById('lightboxTitulo').textContent = img.alt || '';
        document.getElementById('lightboxDescripcion').textContent = '';
        document.getElementById('lightbox').style.display = 'flex';
        await cargarComentarios(imagenActual);
      });
    });
  } catch (err) {
    console.error('Error al cargar inicio', err);
    feed.innerHTML = '<p>Error al cargar publicaciones.</p>';
  }
});
