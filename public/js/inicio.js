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
        <img src="${pub.url}" alt="${pub.titulo}">
        <p><strong>${pub.titulo}</strong></p>
        <p>por <a href="perfil.html?usuario_id=${pub.usuario_id}">${pub.autor}</a></p>
        <p class="fecha-publicacion">📅 Publicado el ${fechaFormateada}</p>`;
      feed.appendChild(div);
    });

    document.querySelectorAll('.obra-publica img').forEach((img) => {
      img.addEventListener('click', () => {
        document.getElementById('lightboxImagen').src = img.src;
        document.getElementById('lightboxTitulo').textContent = img.alt || '';
        document.getElementById('lightboxDescripcion').textContent = '';
        document.getElementById('lightbox').style.display = 'flex';
      });
    });

    document.getElementById('cerrarLightbox').addEventListener('click', () => {
      document.getElementById('lightbox').style.display = 'none';
    });
  } catch (err) {
    console.error('Error al cargar inicio', err);
    feed.innerHTML = '<p>Error al cargar publicaciones.</p>';
  }
});
