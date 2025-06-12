// public/js/auth.js

export async function obtenerUsuarioActual() {
  try {
    const res = await fetch('/api/usuarios/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function verificarSesion() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'login.html';
  }
  return usuario;
}
