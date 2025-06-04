document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const perfilId = params.get("usuario_id");
  const visitante = JSON.parse(localStorage.getItem("usuarioActual"));

  if (!visitante) {
    window.location.href = "login.html";
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
      document.body.innerHTML = "<p>Perfil no encontrado.</p>";
      return;
    }

    // Mostrar datos personales
    const imgPerfil = perfil.imagen_perfil
      ? `/assets/${perfil.imagen_perfil}`
      : "/assets/default-profile.png";
    document.getElementById("nombrePerfil").textContent = perfil.nombre;
    document.getElementById("imagenPerfil").src = imgPerfil;
    document.getElementById("intereses").textContent = `🎨 Intereses: ${
      perfil.intereses || "Sin datos"
    }`;
    document.getElementById("antecedentes").textContent = `📜 Antecedentes: ${
      perfil.antecedentes || "Sin datos"
    }`;

    if (esMiPerfil) {
      document.getElementById("accionesPropias").style.display = "block";
      document.getElementById("crearAlbumBtn").addEventListener("click", () => {
        window.location.href = "albumes.html";
      });
    }

    // IMÁGENES DESTACADAS
    const galeria = document.getElementById("galeriaObras");
    galeria.innerHTML = "";

    const resImgs = await fetch(
      `http://localhost:3000/api/imagenes/usuario/${idPerfil}`
    );
    const imagenes = await resImgs.json();

    const visibles = imagenes
      .filter((img) => puedeVerImagen(img, idVisitante, esMiPerfil))
      .slice(0, 3);

    if (visibles.length === 0) {
      galeria.innerHTML = "<p>No hay imágenes destacadas disponibles.</p>";
    } else {
      visibles.forEach((img) => {
        const div = document.createElement("div");
        div.classList.add("obra-publica");
        div.innerHTML = `
          <img src="${img.url_archivo}" alt="${img.descripcion || ""}">
          ${img.descripcion ? `<p>${img.descripcion}</p>` : ""}
        `;
        div.querySelector("img").addEventListener("click", () => {
          document.getElementById("lightboxImagen").src = img.url_archivo;
          document.getElementById("lightboxTitulo").textContent =
            img.descripcion || "";
          document.getElementById("lightboxDescripcion").textContent = "";
          document.getElementById("lightbox").style.display = "flex";
        });
        galeria.appendChild(div);
      });
    }

    // ÁLBUMES
    const albumesContenedor = document.getElementById("listaAlbumes");
    albumesContenedor.innerHTML = "";

    const resAlbumes = await fetch(
      `http://localhost:3000/api/albumes/usuario/${idPerfil}`
    );
    const albumes = await resAlbumes.json();

    if (albumes.length === 0) {
      albumesContenedor.innerHTML =
        "<p>Este usuario aún no tiene álbumes públicos.</p>";
    } else {
      albumes.forEach((album) => {
        const div = document.createElement("div");
        div.classList.add("album");

        const imagenesHTML = (album.imagenes || [])
          .filter((img) => puedeVerImagen(img, idVisitante, esMiPerfil))
          .map(
            (img) => `
              <div class="imagen-album">
                <img src="${img.url_archivo}" alt="${img.descripcion || ""}">
                ${img.descripcion ? `<p>${img.descripcion}</p>` : ""}
              </div>
            `
          )
          .join("");

        div.innerHTML = `
          <h4>${album.titulo}</h4>
          <p>${imagenesHTML.length} ${
          imagenesHTML.length === 1 ? "imagen" : "imágenes"
        } visibles</p>
          <div class="imagenes-album">${imagenesHTML}</div>
        `;

        albumesContenedor.appendChild(div);
      });
    }

    // LIGHTBOX
    document.getElementById("cerrarLightbox").addEventListener("click", () => {
      document.getElementById("lightbox").style.display = "none";
    });

    document.querySelectorAll(".imagenes-album img").forEach((img) => {
      img.addEventListener("click", () => {
        document.getElementById("lightboxImagen").src = img.src;
        document.getElementById("lightboxTitulo").textContent = img.alt || "";
        document.getElementById("lightboxDescripcion").textContent = "";
        document.getElementById("lightbox").style.display = "flex";
      });
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuarioActual");
        window.location.href = "index.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    document.body.innerHTML = "<p>Error al cargar el perfil.</p>";
  }
});

function puedeVerImagen(imagen, visitanteId, esMiPerfil) {
  if (esMiPerfil) return true;
  if (imagen.visibilidad === "publica") return true;
  if (imagen.visibilidad === "privada_todos") {
    return (
      Array.isArray(imagen.seguidores) &&
      imagen.seguidores.includes(visitanteId)
    );
  }
  if (imagen.visibilidad === "privada_select") {
    return (
      Array.isArray(imagen.destinatarios) &&
      imagen.destinatarios.includes(visitanteId)
    );
  }
  return false;
}
