// ============================================
// SHARED UTILITIES — app.js
// Load this on every page (except login)
// ============================================

const API_BASE = '/api';

/* ── Session Guard ── */
function getSession() {
  const data = sessionStorage.getItem('currentUser');
  if (!data) { window.location.href = '/'; return null; }
  return JSON.parse(data);
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = '/';
}

/* ── Init shared UI ── */
document.addEventListener('DOMContentLoaded', () => {
  const user = getSession();
  if (!user) return;

  // Populate user card in sidebar
  const nameEl   = document.getElementById('sidebarUserName');
  const roleEl   = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarAvatar');
  if (nameEl)   nameEl.textContent   = user.username;
  if (roleEl)   roleEl.textContent   = user.rol;
  if (avatarEl) avatarEl.textContent = user.username.slice(0,2).toUpperCase();

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) logout();
  });

  // Mobile sidebar toggle
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));

  // Close sidebar on nav click (mobile)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar?.classList.remove('open');
    });
  });

  // Mark active nav item
  const current = window.location.pathname.split('/')[1] || 'dashboard';
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    if (el.dataset.page === current) el.classList.add('active');
  });
});

/* ── Toast System ── */
function showToast(msg, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn .25s ease reverse forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/* ── Confirm Dialog ── */
function showConfirm(title, text) {
  return new Promise(resolve => {
    let overlay = document.getElementById('confirmOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'confirmOverlay';
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <p class="confirm-title" id="confirmTitle"></p>
          <p class="confirm-text" id="confirmText"></p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" id="confirmCancel">Cancelar</button>
            <button class="btn btn-danger" id="confirmOk">Eliminar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent  = text;
    overlay.classList.add('open');

    const ok     = document.getElementById('confirmOk');
    const cancel = document.getElementById('confirmCancel');

    function cleanup(result) {
      overlay.classList.remove('open');
      ok.replaceWith(ok.cloneNode(true));
      cancel.replaceWith(cancel.cloneNode(true));
      resolve(result);
    }

    document.getElementById('confirmOk').addEventListener('click',     () => cleanup(true),  { once: true });
    document.getElementById('confirmCancel').addEventListener('click',  () => cleanup(false), { once: true });
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(false); }, { once: true });
  });
}

/* ── Modal helpers ── */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── API helpers ── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ── Number formatters ── */
function formatCurrency(val) {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}
