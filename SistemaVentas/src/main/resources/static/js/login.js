// ============================================
// LOGIN PAGE — login.js
// ============================================

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {

  // ── Referencias ────────────────────────────────────────────────────────────
  const form       = document.getElementById('loginForm');
  const usernameIn = document.getElementById('username');
  const passwordIn = document.getElementById('password');
  const btn        = document.getElementById('loginBtn');
  const errorBox   = document.getElementById('errorMsg');
  const errorText  = document.getElementById('errorMsgText');
  const pwToggle   = document.getElementById('pwToggle');

  // Registro
  const openRegisterBtn  = document.getElementById('openRegisterBtn');
  const closeRegisterBtn = document.getElementById('closeRegisterBtn');
  const registerOverlay  = document.getElementById('registerOverlay');
  const registerForm     = document.getElementById('registerForm');
  const registerBtn      = document.getElementById('registerBtn');
  const regErrorBox      = document.getElementById('registerErrorMsg');
  const regErrorText     = document.getElementById('registerErrorText');
  const regPwToggle      = document.getElementById('regPwToggle');

  // ── Password toggle (login) ────────────────────────────────────────────────
  pwToggle?.addEventListener('click', () => togglePassword(passwordIn, pwToggle));

  // ── Password toggle (registro) ────────────────────────────────────────────
  regPwToggle?.addEventListener('click', () => {
    const pw = document.getElementById('regPassword');
    togglePassword(pw, regPwToggle);
  });

  function togglePassword(input, btn) {
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
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
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorBox, [usernameIn, passwordIn]);

    const username = usernameIn.value.trim();
    const password = passwordIn.value.trim();

    if (!username || !password) {
      showError(errorBox, errorText, 'Por favor ingresa usuario y contraseña.', [usernameIn, passwordIn]);
      return;
    }

    setLoading(btn, true);

    try {
      const res = await fetch(`${API_BASE}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 401) {
        showError(errorBox, errorText, 'Usuario o contraseña incorrectos, o cuenta inactiva.', [usernameIn, passwordIn]);
        setLoading(btn, false);
        return;
      }
      if (!res.ok) throw new Error('Error al conectar con el servidor.');

      const user = await res.json();

      // Guardar sesión (sin foto — se carga aparte)
      sessionStorage.setItem('currentUser', JSON.stringify({
        id:       user.codigoUsuario,
        username: user.username,
        email:    user.email,
        rol:      user.rol,
        estado:   user.estado,
      }));

      window.location.href = '/dashboard';

    } catch (err) {
      showError(errorBox, errorText, err.message || 'Error al iniciar sesión.', [usernameIn, passwordIn]);
      setLoading(btn, false);
    }
  });

  // Clear errors on input
  [usernameIn, passwordIn].forEach(el => {
    el.addEventListener('input', () => hideError(errorBox, [usernameIn, passwordIn]));
  });

  // ── MODAL REGISTRO ─────────────────────────────────────────────────────────
  openRegisterBtn?.addEventListener('click', () => {
    registerOverlay.classList.add('open');
    registerForm.reset();
    hideError(regErrorBox, []);
  });

  closeRegisterBtn?.addEventListener('click', () => closeRegister());

  registerOverlay?.addEventListener('click', (e) => {
    if (e.target === registerOverlay) closeRegister();
  });

  function closeRegister() {
    registerOverlay.classList.remove('open');
  }

  // ── SUBMIT REGISTRO ────────────────────────────────────────────────────────
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(regErrorBox, []);

    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirm  = document.getElementById('regConfirm').value.trim();

    // Validaciones frontend
    if (!username || !password) {
      showError(regErrorBox, regErrorText, 'Usuario y contraseña son obligatorios.');
      return;
    }
    if (password.length < 6) {
      showError(regErrorBox, regErrorText, 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      showError(regErrorBox, regErrorText, 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(registerBtn, true);

    try {
      const res = await fetch(`${API_BASE}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, rol: 'vendedor' }),
      });

      const body = await res.text();

      if (res.status === 409) {
        showError(regErrorBox, regErrorText, body || 'El usuario ya existe.');
        setLoading(registerBtn, false);
        return;
      }
      if (!res.ok) throw new Error(body || 'Error al registrar.');

      // Éxito — mostrar mensaje y cerrar
      showRegisterSuccess();

    } catch (err) {
      showError(regErrorBox, regErrorText, err.message);
      setLoading(registerBtn, false);
    }
  });

  function showRegisterSuccess() {
    // Reemplazar formulario con mensaje de éxito
    const modal = document.getElementById('registerModal');
    const existingForm = modal.querySelector('#registerForm');
    const existingError = modal.querySelector('#registerErrorMsg');
    if (existingError) existingError.style.display = 'none';
    if (existingForm) existingForm.style.display = 'none';

    let successDiv = modal.querySelector('.register-success');
    if (!successDiv) {
      successDiv = document.createElement('div');
      successDiv.className = 'register-success visible';
      successDiv.innerHTML = `
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3>¡Cuenta creada!</h3>
        <p>Tu cuenta fue registrada exitosamente.<br>Ya puedes iniciar sesión.</p>
      `;
      modal.appendChild(successDiv);
    } else {
      successDiv.classList.add('visible');
    }

    setTimeout(() => {
      closeRegister();
      // Restaurar modal para próxima vez
      setTimeout(() => {
        if (existingForm) existingForm.style.display = '';
        if (existingError) existingError.style.display = '';
        if (successDiv) successDiv.classList.remove('visible');
        registerForm.reset();
        setLoading(registerBtn, false);
      }, 400);
    }, 2000);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showError(box, textEl, msg, inputs = []) {
    if (textEl) textEl.textContent = msg;
    else box.textContent = msg;
    box.classList.add('visible');
    inputs.forEach(el => { if (el) el.style.borderColor = 'var(--red)'; });
  }

  function hideError(box, inputs = []) {
    box?.classList.remove('visible');
    inputs.forEach(el => { if (el) el.style.borderColor = ''; });
  }

  function setLoading(btn, state) {
    btn.classList.toggle('loading', state);
    btn.disabled = state;
  }
});