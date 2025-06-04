document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioTemporal"));
  if (!localStorage.getItem("token") || !usuario) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById(
    "infoUsuarioAlbumes"
  ).textContent = `Álbumes de ${usuario.nombre}`;

  const crearAlbumForm = document.getElementById("crearAlbumForm");
  const listaAlbumes = document.getElementById("listaAlbumes");
  const logoutBtn = document.getElementById("logoutBtn");

  const mensajeAlbum = document.getElementById("mensajeAlbum");
  const mensajeImagen = document.getElementById("mensajeImagen");

  const seguidoresIds = usuario.amigos || [];
  const usuariosSimulados =
    JSON.parse(localStorage.getItem("usuariosSimulados")) || [];

  let albumes = [];

  if (usuario.albumes && Array.isArray(usuario.albumes)) {
    albumes = usuario.albumes;
  } else {
    usuario.albumes = [];
    localStorage.setItem("usuarioTemporal", JSON.stringify(usuario));
  }

  function renderAlbumes() {
    listaAlbumes.innerHTML = "";
    albumes.forEach((album) => {
      const div = document.createElement("div");
      div.classList.add("album");

      div.innerHTML = `
        <h3 contenteditable="true" class="titulo-album" data-id="${album.id}">${
        album.titulo
      }</h3>
        <button class="eliminarAlbumBtn" data-id="${
          album.id
        }">🗑️ Eliminar álbum</button>

        <div class="imagenes-album">
          ${album.imagenes
            .map(
              (img, index) => `
            <div class="imagen-contenedor">
              <img src="${img.url}" alt="${img.titulo || ""}" title="${
                img.descripcion || ""
              }">
              <button class="eliminarImagenBtn" data-album-id="${
                album.id
              }" data-img-index="${index}">🗑️</button>
            </div>
          `
            )
            .join("")}
        </div>

        <form class="formAgregarImagen" data-album-id="${album.id}">
          <input type="file" accept="image/*" name="imagen" required><br>
          <input type="text" name="titulo" placeholder="Título"><br>
          <textarea name="descripcion" placeholder="Descripción (opcional)"></textarea><br>

          <fieldset>
            <legend>Visibilidad</legend>
            <label><input type="radio" name="visibilidad-${
              album.id
            }" value="publica" checked> Pública</label><br>
            <label><input type="radio" name="visibilidad-${
              album.id
            }" value="privada_todos"> Solo seguidores</label><br>
            <label><input type="radio" name="visibilidad-${
              album.id
            }" value="privada_select"> Seguidores seleccionados</label>
            <div id="listaSeguidores-${
              album.id
            }" style="display:none; margin-top:0.5rem;">
              <p>Seleccioná seguidores:</p>
              <div class="seguidoresCheckboxes"></div>
            </div>
          </fieldset>

          <button type="submit">Subir imagen</button>
        </form>
      `;

      listaAlbumes.appendChild(div);

      const radios = div.querySelectorAll(
        `input[name="visibilidad-${album.id}"]`
      );
      const seccionLista = div.querySelector(`#listaSeguidores-${album.id}`);
      const checkboxesCont = seccionLista.querySelector(
        ".seguidoresCheckboxes"
      );

      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.value === "privada_select" && radio.checked) {
            seccionLista.style.display = "block";
            if (checkboxesCont.innerHTML === "") {
              seguidoresIds.forEach((id) => {
                const seguidor = usuariosSimulados.find((u) => u.id === id);
                if (seguidor) {
                  const label = document.createElement("label");
                  label.innerHTML = `
                    <input type="checkbox" name="destinatarios" value="${id}"> ${seguidor.nombre}
                  `;
                  checkboxesCont.appendChild(label);
                }
              });
            }
          } else {
            seccionLista.style.display = "none";
          }
        });
      });
    });

    document.querySelectorAll(".formAgregarImagen").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const albumId = parseInt(form.dataset.albumId);
        const file = form.imagen.files[0];
        if (!file) return alert("Seleccioná una imagen");

        const urlTemporal = URL.createObjectURL(file);
        const titulo = form.titulo.value || "";
        const descripcion = form.descripcion.value || "";
        const visibilidad = form.querySelector(
          `input[name="visibilidad-${albumId}"]:checked`
        ).value;

        const destinatarios = Array.from(
          form.querySelectorAll("input[name='destinatarios']:checked")
        ).map((cb) => parseInt(cb.value));

        const nuevaImagen = { url: urlTemporal, visibilidad };
        if (titulo.trim()) nuevaImagen.titulo = titulo.trim();
        if (descripcion.trim()) nuevaImagen.descripcion = descripcion.trim();
        if (visibilidad === "privada_select")
          nuevaImagen.destinatarios = destinatarios;

        const album = albumes.find((a) => a.id === albumId);
        if (album.imagenes.length >= 20) {
          alert("Este álbum ya tiene 20 imágenes.");
          return;
        }

        album.imagenes.push(nuevaImagen);
        guardarYActualizar();

        if (mensajeImagen) {
          mensajeImagen.textContent = "✅ Imagen subida correctamente.";
          mensajeImagen.style.display = "block";
          setTimeout(() => {
            mensajeImagen.style.display = "none";
          }, 3000);
        }
      });
    });

    document.querySelectorAll(".eliminarAlbumBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        if (confirm("¿Seguro que querés eliminar este álbum?")) {
          albumes = albumes.filter((a) => a.id !== id);
          guardarYActualizar();
        }
      });
    });

    document.querySelectorAll(".eliminarImagenBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const albumId = parseInt(btn.dataset.albumId);
        const imgIndex = parseInt(btn.dataset.imgIndex);
        const album = albumes.find((a) => a.id === albumId);
        if (!album) return;
        if (confirm("¿Seguro que querés eliminar esta imagen?")) {
          album.imagenes.splice(imgIndex, 1);
          guardarYActualizar();
        }
      });
    });

    document.querySelectorAll(".titulo-album").forEach((titulo) => {
      titulo.addEventListener("blur", () => {
        const id = parseInt(titulo.dataset.id);
        const album = albumes.find((a) => a.id === id);
        if (album) {
          album.titulo = titulo.textContent.trim();
          guardarYActualizar(false);
        }
      });
    });
  }

  function guardarYActualizar(render = true) {
    usuario.albumes = albumes;
    usuario.imagenes = [];
    albumes.forEach((a) =>
      a.imagenes.forEach((img) => usuario.imagenes.push(img))
    );
    localStorage.setItem("usuarioTemporal", JSON.stringify(usuario));
    if (render) renderAlbumes();
  }

  crearAlbumForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloAlbum").value.trim();
    if (titulo) {
      albumes.push({ id: Date.now(), titulo, imagenes: [] });
      guardarYActualizar();

      if (mensajeAlbum) {
        mensajeAlbum.textContent = "✅ Álbum creado exitosamente.";
        mensajeAlbum.style.display = "block";
        setTimeout(() => {
          mensajeAlbum.style.display = "none";
        }, 3000);
      }

      crearAlbumForm.reset();
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  renderAlbumes();
});
