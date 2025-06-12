document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorDisplay = document.getElementById('loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorDisplay.textContent = '❌ ' + data.mensaje;
        return;
      }

      window.location.href = 'perfil.html';
    } catch (error) {
      console.error('Error:', error);
      errorDisplay.textContent = '❌ Error al conectar con el servidor.';
    }
  });
});
