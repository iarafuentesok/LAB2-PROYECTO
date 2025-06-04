document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed");
  const usuario = JSON.parse(localStorage.getItem("usuarioTemporal"));
  const usuarios = JSON.parse(localStorage.getItem("usuariosSimulados")) || [];

  if (!usuario || !localStorage.getItem("token")) {
    window.location.href = "login.html";
    return;
  }

  const publicaciones = [];

  const amigosIds = usuario.amigos || [];

  amigosIds.forEach((id) => {
    const amigo = usuarios.find((u) => u.id === id && u.modoVitrina);
    if (amigo && Array.isArray(amigo.imagenes)) {
      amigo.imagenes.forEach((img) => {
        if (puedeVerImagen(img, usuario, amigo)) {
          publicaciones.push({
            autor: amigo.nombre,
            usuario_id: amigo.id,
            titulo: img.titulo,
            url: img.url,
            fecha: img.fecha || new Date().toISOString(),
          });
        }
      });
    }
  });

  if (publicaciones.length === 0) {
    feed.innerHTML = "<p>Tus contactos aún no compartieron obras públicas.</p>";
    return;
  }

  publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  publicaciones.forEach((pub) => {
    const fechaFormateada = new Date(pub.fecha).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const div = document.createElement("div");
    div.classList.add("obra-publica");
    div.innerHTML = `
      <img src="${pub.url}" alt="${pub.titulo}">
      <p><strong>${pub.titulo}</strong></p>
      <p>por <a href="perfil.html?usuario_id=${pub.usuario_id}">${pub.autor}</a></p>
      <p class="fecha-publicacion">📅 Publicado el ${fechaFormateada}</p>
    `;
    feed.appendChild(div);
  });
  // Activar lightbox para publicaciones
  document.querySelectorAll(".obra-publica img").forEach((img) => {
    img.addEventListener("click", () => {
      document.getElementById("lightboxImagen").src = img.src;
      document.getElementById("lightboxTitulo").textContent = img.alt || "";
      document.getElementById("lightboxDescripcion").textContent = ""; // si más adelante guardás descripciones
      document.getElementById("lightbox").style.display = "flex";
    });
  });

  document.getElementById("cerrarLightbox").addEventListener("click", () => {
    document.getElementById("lightbox").style.display = "none";
  });
});
