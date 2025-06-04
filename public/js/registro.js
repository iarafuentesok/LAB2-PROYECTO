document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  const mensaje = document.getElementById("mensajeRegistro");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      mensaje.style.color = "red";
      mensaje.textContent = "Las contraseñas no coinciden.";
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/usuarios/registro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        mensaje.style.color = "green";
        mensaje.textContent = "✅ Registro exitoso. Redirigiendo...";
        form.reset();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        mensaje.style.color = "red";
        mensaje.textContent = "❌ " + data.mensaje;
      }
    } catch (error) {
      mensaje.style.color = "red";
      mensaje.textContent = "❌ Error al conectar con el servidor.";
      console.error("Error:", error);
    }
  });
});
