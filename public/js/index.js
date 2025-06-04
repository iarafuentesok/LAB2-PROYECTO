document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    const mensaje = document.createElement("p");
    mensaje.innerHTML =
      'Ya iniciaste sesión. Ir a tu <a href="perfil.html">perfil</a>';
    document.querySelector("header").appendChild(mensaje);
  }
});
