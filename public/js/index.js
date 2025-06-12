async function obtenerUsuario() {
  try {
    const res = await fetch('/api/usuarios/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const usuario = await obtenerUsuario();
  if (usuario) {
    const mensaje = document.createElement('p');
    mensaje.innerHTML = 'Ya iniciaste sesión. Ir a tu <a href="perfil.html">perfil</a>';
    document.querySelector('header').appendChild(mensaje);
  }
});
