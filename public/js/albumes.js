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
  const usuario = await obtenerUsuario();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('infoUsuarioAlbumes').textContent = `Álbumes de ${usuario.nombre}`;

  const crearAlbumForm = document.getElementById('crearAlbumForm');
  const listaAlbumes = document.getElementById('listaAlbumes');
  const mensajeAlbum = document.getElementById('mensajeAlbum');
  const mensajeImagen = document.getElementById('mensajeImagen');

  let albumes = [];

  async function cargarAlbumes() {
    try {
      const res = await fetch(`/api/albumes/usuario/${usuario.id}`);
      albumes = await res.json();
      renderAlbumes();
    } catch (err) {
      console.error('Error al cargar álbumes', err);
    }
  }

  function renderAlbumes() {
    listaAlbumes.innerHTML = '';
    albumes.forEach((album) => {
      const div = document.createElement('div');
      div.classList.add('album');

      const imagenesHTML = (album.imagenes || [])
        .map((img) => `<img src="${img.url_archivo}" alt="${img.descripcion || ''}">`)
        .join('');

      div.innerHTML = `
        <h3>${album.titulo}</h3>
        <div class="imagenes-album">${imagenesHTML}</div>
        <form class="formAgregarImagen" data-album-id="${album.id}">
          <input type="file" name="imagen" accept="image/*" required><br>
          <input type="text" name="descripcion" placeholder="Descripción"><br>
          <select name="visibilidad">
            <option value="publica">Pública</option>
            <option value="privada">Solo amigos</option>
            <option value="compartida">Seleccionar amigos (IDs separados por coma)</option>
          </select><br>
          <input type="text" name="destinatarios" placeholder="1,2,3" style="display:none"><br>
          <button type="submit">Subir imagen</button>
        </form>
      `;
      listaAlbumes.appendChild(div);
    });

    document.querySelectorAll('select[name="visibilidad"]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const input = sel.parentElement.querySelector('input[name="destinatarios"]');
        input.style.display = sel.value === 'compartida' ? 'block' : 'none';
      });
    });

    document.querySelectorAll('.formAgregarImagen').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const albumId = form.dataset.albumId;
        const file = form.imagen.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('imagen', file);
        formData.append('descripcion', form.descripcion.value);
        formData.append('visibilidad', form.visibilidad.value);
        formData.append('id_usuario', usuario.id);
        if (form.visibilidad.value === 'compartida' && form.destinatarios.value.trim()) {
          form.destinatarios.value.split(',').forEach((id) => {
            formData.append('destinatarios', id.trim());
          });
        }
        const resp = await fetch(`/api/albumes/imagen/${albumId}`, {
          method: 'POST',
          body: formData,
        });
        if (resp.ok) {
          mensajeImagen.textContent = '✅ Imagen subida correctamente.';
          await cargarAlbumes();
        } else {
          mensajeImagen.textContent = '❌ Error al subir la imagen.';
        }
        setTimeout(() => (mensajeImagen.textContent = ''), 3000);
      });
    });
  }

  crearAlbumForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('tituloAlbum').value.trim();
    if (!titulo) return;
    const res = await fetch('/api/albumes/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, id_usuario: usuario.id }),
    });
    if (res.ok) {
      mensajeAlbum.textContent = '✅ Álbum creado exitosamente.';
      await cargarAlbumes();
      crearAlbumForm.reset();
    } else {
      mensajeAlbum.textContent = '❌ Error al crear el álbum.';
    }
    setTimeout(() => (mensajeAlbum.textContent = ''), 3000);
  });

  await cargarAlbumes();
});
