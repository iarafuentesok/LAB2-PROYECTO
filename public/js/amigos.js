document.addEventListener("DOMContentLoaded", () => {
  const resultadosBusqueda = document.getElementById("resultadosBusqueda");
  const solicitudesRecibidas = document.getElementById("solicitudesRecibidas");
  const listaAmigos = document.getElementById("listaAmigos");
  const logoutBtn = document.getElementById("logoutBtn");

  // Mocks
  const usuariosSimulados = [
    { id: 1, nombre: "Lucía Gómez" },
    { id: 2, nombre: "Mauro Pérez" },
    { id: 3, nombre: "Esteban Ruiz" },
  ];
  const solicitudesSimuladas = [{ id: 1, nombre: "Lucía Gómez" }];
  const amigosSimulados = [{ id: 2, nombre: "Mauro Pérez" }];

  // Buscar usuario
  document.getElementById("buscarBtn").addEventListener("click", () => {
    const texto = document.getElementById("busqueda").value.toLowerCase();
    const filtrados = usuariosSimulados.filter((u) =>
      u.nombre.toLowerCase().includes(texto)
    );
    resultadosBusqueda.innerHTML = "";
    filtrados.forEach((usuario) => {
      const li = document.createElement("li");
      li.innerHTML = `${usuario.nombre} <button>Enviar solicitud</button>`;
      resultadosBusqueda.appendChild(li);
    });
  });

  // Mostrar solicitudes
  solicitudesSimuladas.forEach((usuario) => {
    const li = document.createElement("li");
    li.innerHTML = `${usuario.nombre}
      <button>Aceptar</button>
      <button>Rechazar</button>`;
    solicitudesRecibidas.appendChild(li);
  });

  // Mostrar amigos
  amigosSimulados.forEach((usuario) => {
    const li = document.createElement("li");
    li.textContent = usuario.nombre;
    listaAmigos.appendChild(li);
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
  const imagenesAmigos = document.getElementById("imagenesAmigos");

  // Simulación: una amiga aceptada compartió una imagen
  const imagenesCompartidas = [
    {
      amigo: "Lucía Gómez",
      titulo: "Tapiz en macramé",
      url: "assets/macrame1.jpg",
    },
    {
      amigo: "Esteban Ruiz",
      titulo: "Pintura acrílica",
      url: "assets/cuadro1.jpg",
    },
  ];

  imagenesCompartidas.forEach((img) => {
    const div = document.createElement("div");
    div.classList.add("obra-publica");
    div.innerHTML = `
    <img src="${img.url}" alt="${img.titulo}">
    <p><strong>${img.titulo}</strong><br>por ${img.amigo}</p>
  `;
    imagenesAmigos.appendChild(div);
  });
});
