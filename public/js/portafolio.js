document.addEventListener("DOMContentLoaded", () => {
  const galeria = document.getElementById("galeriaPublica");
  const usuarios = JSON.parse(localStorage.getItem("usuariosSimulados")) || [];
  const visitante = JSON.parse(localStorage.getItem("usuarioTemporal")) || null;
  const token = localStorage.getItem("token");

  const obrasPublicas = [];

  usuarios.forEach((usuario) => {
    if (usuario.modoVitrina && Array.isArray(usuario.imagenes)) {
      usuario.imagenes.forEach((img) => {
        if (puedeVerImagen(img, visitante, usuario)) {
          obrasPublicas.push({
            titulo: img.titulo,
            url: img.url,
            autor: usuario.nombre,
            usuario_id: usuario.id,
          });
        }
      });
    }
  });

  if (obrasPublicas.length === 0) {
    galeria.innerHTML =
      "<p>No hay obras públicas disponibles por el momento.</p>";
    return;
  }

  obrasPublicas.forEach((obra) => {
    const div = document.createElement("div");
    div.classList.add("obra-publica");
    div.innerHTML = `
      <img src="${obra.url}" alt="${obra.titulo}">
      <p class="titulo-obra">${obra.titulo}</p>
      <p class="autor-obra">
        por <a href="${
          token ? `perfil.html?usuario_id=${obra.usuario_id}` : "login.html"
        }">
          ${obra.autor}
        </a>
      </p>
    `;
    galeria.appendChild(div);
  });
});
