document.addEventListener("DOMContentLoaded", () => {
  const eventoForm = document.getElementById("eventoForm");
  const listaEventos = document.getElementById("listaEventos");
  const logoutBtn = document.getElementById("logoutBtn");

  let eventos = [
    {
      id: 1,
      titulo: "Feria de Arte Reciclado",
      descripcion: "Exposición de obras creadas con materiales reutilizados.",
      fecha: "2025-06-12",
    },
    {
      id: 2,
      titulo: "Taller de Macramé para principiantes",
      descripcion: "Aprendé las técnicas básicas del macramé.",
      fecha: "2025-06-20",
    },
  ];

  function renderEventos() {
    listaEventos.innerHTML = "";
    eventos.forEach((ev) => {
      const div = document.createElement("div");
      div.classList.add("evento");
      div.innerHTML = `
        <h3>${ev.titulo}</h3>
        <p><strong>Fecha:</strong> ${ev.fecha}</p>
        <p>${ev.descripcion}</p>
        <button disabled>Inscribirse (próximamente)</button>
      `;
      listaEventos.appendChild(div);
    });
  }

  eventoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!titulo || !descripcion || !fecha) return;

    eventos.push({
      id: Date.now(),
      titulo,
      descripcion,
      fecha,
    });

    renderEventos();
    eventoForm.reset();
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  renderEventos();
});
