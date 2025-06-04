// public/js/auth.js

export function obtenerUsuarioActual() {
  try {
    const data = localStorage.getItem("usuarioActual");
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function verificarSesion() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = "login.html";
  }
  return usuario;
}
