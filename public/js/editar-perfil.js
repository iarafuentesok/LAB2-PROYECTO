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
  const form = document.getElementById('perfilForm');
  const passwordForm = document.getElementById('passwordForm');
  const imagenPerfil = document.getElementById('imagenPerfil');
  const mensaje = document.getElementById('perfilMsg');
  const saludo = document.getElementById('saludoUsuario');
  const checkboxVitrina = document.getElementById('modoVitrina');

  const usuario = await obtenerUsuario();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`/api/usuarios/${usuario.id}`);
    const datos = await res.json();
    saludo.textContent = `Hola, ${datos.nombre}`;
    document.getElementById('nombre').value = datos.nombre;
    document.getElementById('intereses').value = datos.intereses || '';
    document.getElementById('antecedentes').value = datos.antecedentes || '';
    imagenPerfil.src = datos.imagen_perfil || 'assets/default-profile.png';
    checkboxVitrina.checked = datos.modo_vitrina === 1;
  } catch (err) {
    console.error('Error al cargar perfil', err);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value.trim());
    formData.append('intereses', document.getElementById('intereses').value.trim());
    formData.append('antecedentes', document.getElementById('antecedentes').value.trim());
    formData.append('modo_vitrina', checkboxVitrina.checked);
    if (form.imagen.files.length > 0) {
      formData.append('imagen', form.imagen.files[0]);
    }

    const resp = await fetch(`/api/usuarios/${usuario.id}`, {
      method: 'PUT',
      body: formData,
    });

    if (resp.ok) {
      mensaje.style.color = 'green';
      mensaje.textContent = 'Cambios guardados correctamente ✔️';
      await resp.json().catch(() => null);
    } else {
      mensaje.style.color = 'red';
      mensaje.textContent = 'Error al actualizar perfil';
    }

    setTimeout(() => (mensaje.textContent = ''), 3000);
  });

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const actual = document.getElementById('passwordActual').value;
    const nuevaPass = document.getElementById('passwordNuevo').value;
    if (nuevaPass.trim().length < 4) {
      mensaje.style.color = 'red';
      mensaje.textContent = 'La contraseña debe tener al menos 4 caracteres.';
      return;
    }

    const resp = await fetch(`/api/usuarios/${usuario.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password_actual: actual,
        password_nuevo: nuevaPass,
      }),
    });

    if (resp.ok) {
      mensaje.style.color = 'green';
      mensaje.textContent = 'Contraseña actualizada ✔️';
    } else {
      mensaje.style.color = 'red';
      mensaje.textContent = 'Error al actualizar contraseña';
    }

    setTimeout(() => (mensaje.textContent = ''), 3000);
  });
});
