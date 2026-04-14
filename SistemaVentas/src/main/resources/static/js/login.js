// ============================================
// LOGIN PAGE — login.js
// ============================================

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('loginForm');
  const usernameIn = document.getElementById('username');
  const passwordIn = document.getElementById('password');
  const btn        = document.getElementById('loginBtn');
  const errorBox   = document.getElementById('errorMsg');
  const pwToggle   = document.getElementById('pwToggle');

  // Password visibility toggle
  pwToggle?.addEventListener('click', () => {
    const isText = passwordIn.type === 'text';
    passwordIn.type = isText ? 'password' : 'text';
    pwToggle.innerHTML = isText
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
           <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
           <line x1="1" y1="1" x2="23" y2="23"/>
         </svg>`;
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const username = usernameIn.value.trim();
    const password = passwordIn.value.trim();

    if (!username || !password) {
      showError('Por favor ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      // Fetch all users and match credentials
      const res = await fetch(`${API_BASE}/usuarios`);
      if (!res.ok) throw new Error('Error al conectar con el servidor.');
      const users = await res.json();

      const match = users.find(
        u => u.username === username && u.password === password && u.estado === 1
      );

      if (!match) {
        showError('Usuario o contraseña incorrectos, o cuenta inactiva.');
        setLoading(false);
        return;
      }

      // Store session
      sessionStorage.setItem('currentUser', JSON.stringify({
        id:       match.codigoUsuario,
        username: match.username,
        email:    match.email,
        rol:      match.rol,
        estado:   match.estado,
      }));

      // Redirect to dashboard
      window.location.href = '/dashboard';

    } catch (err) {
      showError(err.message || 'Error al iniciar sesión. Intenta nuevamente.');
      setLoading(false);
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
    usernameIn.style.borderColor = 'var(--red)';
    passwordIn.style.borderColor = 'var(--red)';
  }

  function hideError() {
    errorBox.classList.remove('visible');
    usernameIn.style.borderColor = '';
    passwordIn.style.borderColor = '';
  }

  function setLoading(state) {
    btn.classList.toggle('loading', state);
    btn.disabled = state;
  }

  // Clear errors on input
  [usernameIn, passwordIn].forEach(el => {
    el.addEventListener('input', hideError);
  });
});
