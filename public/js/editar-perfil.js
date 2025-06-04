document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("perfilForm");
  const passwordForm = document.getElementById("passwordForm");
  const imagenPerfil = document.getElementById("imagenPerfil");
  const mensaje = document.getElementById("perfilMsg");
  const logoutBtn = document.getElementById("logoutBtn");
  const saludo = document.getElementById("saludoUsuario");
  const checkboxVitrina = document.getElementById("modoVitrina");

  let usuario = JSON.parse(localStorage.getItem("usuarioTemporal"));

  if (!localStorage.getItem("token") || !usuario) {
    window.location.href = "login.html";
    return;
  }

  // Mostrar saludo
  saludo.textContent = `Hola, ${usuario.nombre}`;

  // Precargar datos
  document.getElementById("nombre").value = usuario.nombre;
  document.getElementById("intereses").value = usuario.intereses || "";
  document.getElementById("antecedentes").value = usuario.antecedentes || "";
  imagenPerfil.src = usuario.imagen || "assets/default-profile.png";
  checkboxVitrina.checked = usuario.modoVitrina || false;

  // Guardar perfil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    usuario.nombre = document.getElementById("nombre").value.trim();
    usuario.intereses = document.getElementById("intereses").value.trim();
    usuario.antecedentes = document.getElementById("antecedentes").value.trim();
    usuario.modoVitrina = checkboxVitrina.checked;

    const imagenInput = document.getElementById("imagen");
    if (imagenInput.files.length > 0) {
      const archivo = imagenInput.files[0];
      const base64 = await convertirImagenABase64(archivo);
      usuario.imagen = base64;
    }

    localStorage.setItem("usuarioTemporal", JSON.stringify(usuario));
    mensaje.style.color = "green";
    mensaje.textContent = "Cambios guardados correctamente ✔️";

    saludo.textContent = `Hola, ${usuario.nombre}`;
    imagenPerfil.src = usuario.imagen || "assets/default-profile.png";
  });

  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nuevaPass = document.getElementById("password").value;
    if (nuevaPass.trim().length < 4) {
      mensaje.style.color = "red";
      mensaje.textContent = "La contraseña debe tener al menos 4 caracteres.";
      return;
    }
    usuario.password = nuevaPass;
    localStorage.setItem("usuarioTemporal", JSON.stringify(usuario));
    mensaje.style.color = "green";
    mensaje.textContent = "Contraseña actualizada ✔️";
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});
