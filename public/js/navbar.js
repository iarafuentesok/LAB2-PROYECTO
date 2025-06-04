document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navPublico");
  const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
  const ruta = window.location.pathname;

  if (!nav) return;

  const mostrarNavPublico = () => {
    nav.innerHTML = `
      <a href="index.html">Inicio</a>
      <a href="portafolio.html">Portafolio</a>
      <a href="login.html">Iniciar Sesión</a>
      <a href="registro.html">Registrarse</a>
    `;
  };

  const mostrarNavPrivado = () => {
    nav.innerHTML = `
      <a href="inicio.html">Inicio</a>
      <a href="perfil.html">Perfil</a>
      <a href="albumes.html">Álbumes</a>
      <a href="amigos.html">Amigos</a>
      <a href="eventos.html">Eventos</a>
      <a href="portafolio.html">Portafolio</a>
      <a href="#" id="logoutBtn">Cerrar sesión</a>
    `;
  };

  // NAV lógico por sesión
  if (usuario) {
    mostrarNavPrivado();
  } else {
    mostrarNavPublico();
  }

  // Marcar ruta activa
  document.querySelectorAll("nav a").forEach((link) => {
    if (ruta.includes(link.getAttribute("href"))) {
      link.classList.add("activo");
    }
  });

  // Logout
  document.addEventListener("click", (e) => {
    if (e.target.id === "logoutBtn") {
      e.preventDefault();
      localStorage.removeItem("usuarioActual");
      window.location.href = "index.html";
    }
  });
});
