// ============================================
// SHARED UTILITIES — app.js
// Cargar en todas las páginas (excepto login)
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

/* ══════════════════════════════════════════════════════════════════
   CONTROL DE ACCESO POR ROL
   - administrador : acceso total
   - vendedor      : NO puede ver /usuarios
   - cajero        : SOLO /ventas y /detalle-venta
══════════════════════════════════════════════════════════════════ */
const ROL_ACCESO = {
  administrador: ['dashboard', 'clientes', 'productos', 'ventas', 'detalle-venta', 'usuarios'],
  vendedor:      ['dashboard', 'clientes', 'productos', 'ventas', 'detalle-venta'],
  cajero:        ['ventas', 'detalle-venta'],
};

function checkAccess(user) {
  const rol        = (user.rol || '').toLowerCase();
  const pagina     = window.location.pathname.replace('/', '').split('?')[0] || 'dashboard';
  const permitidas = ROL_ACCESO[rol] || [];

  if (!permitidas.includes(pagina)) {
    const primera = permitidas[0] || 'dashboard';
    window.location.href = `/${primera}`;
  }
}

/* ── Init shared UI ── */
document.addEventListener('DOMContentLoaded', () => {
  const user = getSession();
  if (!user) return;

  checkAccess(user);

  // Sidebar user card
  const nameEl   = document.getElementById('sidebarUserName');
  const roleEl   = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarAvatar');
  if (nameEl)   nameEl.textContent   = user.username;
  if (roleEl)   roleEl.textContent   = user.rol;
  if (avatarEl) avatarEl.textContent = user.username.slice(0,2).toUpperCase();

  // Filtrar sidebar por rol
  applyRoleSidebar(user);

  // Logout (sidebar)
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) logout();
  });

  // Mobile sidebar toggle
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar?.classList.remove('open');
    });
  });

  // Marcar nav activo
  const current = window.location.pathname.split('/')[1] || 'dashboard';
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    if (el.dataset.page === current) el.classList.add('active');
  });

  // Avatar en topbar
  initProfileAvatar(user);
});

/* ── Filtrar sidebar según rol ── */
function applyRoleSidebar(user) {
  const rol        = (user.rol || '').toLowerCase();
  const permitidas = ROL_ACCESO[rol] || [];

  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    if (!permitidas.includes(el.dataset.page)) {
      el.style.display = 'none';
    }
  });

  // Ocultar labels de sección que quedaron sin ítems visibles
  document.querySelectorAll('.nav-section-label').forEach(label => {
    let next = label.nextElementSibling;
    let visible = false;
    while (next && !next.classList.contains('nav-section-label')) {
      if (next.classList.contains('nav-item') && next.style.display !== 'none') {
        visible = true; break;
      }
      next = next.nextElementSibling;
    }
    if (!visible) label.style.display = 'none';
  });
}

/* ══════════════════════════════════════════════════════════════════
   AVATAR EN TOPBAR — inyectado en #topbarRight del sidebar.html
══════════════════════════════════════════════════════════════════ */
function initProfileAvatar(user) {
  const container = document.getElementById('topbarRight');
  if (!container) return;

  container.innerHTML = '';
  container.insertAdjacentHTML('beforeend', buildAvatarHTML(user));

  const avatarBtn  = document.getElementById('profileAvatarBtn');
  const dropdown   = document.getElementById('profileDropdown');
  const avatarImg  = document.getElementById('profileAvatarImg');
  const avatarInit = document.getElementById('profileAvatarInitials');

  // Cargar foto guardada
  loadProfilePhoto(user.id, avatarImg, avatarInit);

  // Toggle dropdown
  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('open');
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', () => dropdown?.classList.remove('open'));

  // Cerrar sesión
  document.getElementById('dropdownLogout')?.addEventListener('click', () => {
    dropdown?.classList.remove('open');
    if (confirm('¿Deseas cerrar sesión?')) logout();
  });

  // Cambiar foto
  document.getElementById('dropdownChangeFoto')?.addEventListener('click', () => {
    dropdown?.classList.remove('open');
    buildPhotoModal(user);   // idempotente
    openPhotoModal(user);
  });

  // Construir modal desde el inicio (carga diferida)
  buildPhotoModal(user);
}

function buildAvatarHTML(user) {
  const isAdmin  = (user.rol || '').toLowerCase() === 'administrador';
  const initials = user.username.slice(0, 2).toUpperCase();

  return `
    <div class="profile-avatar-wrapper">
      <button class="profile-avatar-btn" id="profileAvatarBtn" title="${user.username} — ${user.rol}">
        <img  id="profileAvatarImg"      src="" alt="" style="display:none"/>
        <span id="profileAvatarInitials">${initials}</span>
        ${isAdmin ? '<span class="profile-admin-dot"></span>' : ''}
      </button>

      <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-dropdown-header">
          <p class="pd-name">${user.username}</p>
          <p class="pd-role">${user.rol}</p>
        </div>
        <div class="profile-dropdown-divider"></div>
        <button class="pd-item" id="dropdownChangeFoto">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Cambiar foto de perfil
        </button>
        <div class="profile-dropdown-divider"></div>
        <button class="pd-item pd-item-danger" id="dropdownLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>`;
}

async function loadProfilePhoto(userId, imgEl, initialsEl) {
  if (!imgEl || !initialsEl) return;
  try {
    const res = await fetch(`${API_BASE}/usuarios/foto/${userId}`, { cache: 'no-store' });
    if (!res.ok) { showInitials(imgEl, initialsEl); return; }
    const blob = await res.blob();
    if (!blob.size) { showInitials(imgEl, initialsEl); return; }
    imgEl.onload  = () => { imgEl.style.display = 'block'; initialsEl.style.display = 'none'; };
    imgEl.onerror = () => showInitials(imgEl, initialsEl);
    imgEl.src     = URL.createObjectURL(blob);
  } catch { showInitials(imgEl, initialsEl); }
}

function showInitials(imgEl, initialsEl) {
  if (imgEl)      imgEl.style.display      = 'none';
  if (initialsEl) initialsEl.style.display = 'flex';
}

/* ══════════════════════════════════════════════════════════════════
   MODAL DE FOTO DE PERFIL
══════════════════════════════════════════════════════════════════ */
function buildPhotoModal(user) {
  if (document.getElementById('photoModal')) return;   // ya existe

  const modal = document.createElement('div');
  modal.id        = 'photoModal';
  modal.className = 'photo-modal-overlay';
  modal.innerHTML = `
    <div class="photo-modal-box">
      <div class="photo-modal-header">
        <h3>Foto de perfil</h3>
        <button class="modal-close-x" id="photoModalClose">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="photo-drop-zone" id="photoDropZone">
        <div class="photo-preview-circle">
          <img id="photoPreview" src="" alt="" style="display:none"/>
          <div id="photoPreviewInit">${user.username.slice(0,2).toUpperCase()}</div>
        </div>
        <p class="photo-drop-hint">Arrastra aquí o usa el botón</p>
        <span class="photo-drop-sub">JPG, PNG, WEBP · máx. 5 MB</span>
      </div>

      <!-- El input va ANTES del label para que el for="photoFileInput" lo encuentre -->
      <input type="file" id="photoFileInput" accept="image/jpeg,image/png,image/webp"
        style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"/>

      <div class="photo-modal-actions">
        <!-- Usar <label> en lugar de <button> evita el bloqueo del navegador
             al abrir el file-picker programáticamente desde un modal dinámico -->
        <label for="photoFileInput" class="btn btn-secondary" id="photoSelectBtn"
          style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Elegir imagen
        </label>
        <button class="btn btn-primary" id="photoSaveBtn" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          <span id="photoSaveBtnText">Guardar foto</span>
          <span id="photoSaveSpinner" class="btn-spinner" style="display:none"></span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  let selectedFile = null;

  const doClose = () => {
    modal.classList.remove('open');
    selectedFile = null;
  };
  document.getElementById('photoModalClose').addEventListener('click', doClose);
  modal.addEventListener('click', (e) => { if (e.target === modal) doClose(); });

  /* Seleccionar via input — el <label for="photoFileInput"> ya abre el picker nativamente */
  document.getElementById('photoFileInput').addEventListener('change', (e) =>
    handleFile(e.target.files[0])
  );

  /* Drag & Drop */
  const dz = document.getElementById('photoDropZone');
  dz.addEventListener('dragover',  (e) => { e.preventDefault(); dz.classList.add('dz-hover'); });
  dz.addEventListener('dragleave', ()  => dz.classList.remove('dz-hover'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault(); dz.classList.remove('dz-hover');
    handleFile(e.dataTransfer.files[0]);
  });

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Solo se permiten imágenes (JPG, PNG, WEBP).', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar 5 MB.', 'error'); return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const prev  = document.getElementById('photoPreview');
      const init  = document.getElementById('photoPreviewInit');
      prev.src            = ev.target.result;
      prev.style.display  = 'block';
      init.style.display  = 'none';
      document.getElementById('photoSaveBtn').disabled = false;
    };
    reader.readAsDataURL(file);
  }

  /* Guardar — FormData SIN Content-Type manual */
  document.getElementById('photoSaveBtn').addEventListener('click', async () => {
    if (!selectedFile) return;
    const u = getSession();
    if (!u) return;

    const btn     = document.getElementById('photoSaveBtn');
    const txt     = document.getElementById('photoSaveBtnText');
    const spinner = document.getElementById('photoSaveSpinner');
    btn.disabled       = true;
    txt.style.display  = 'none';
    spinner.style.display = 'inline-block';

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);          // campo "file" que el controller espera

      const res = await fetch(`${API_BASE}/usuarios/foto/${u.id}`, {
        method: 'POST',
        body: fd,
        // NO headers aquí — dejar que el browser ponga multipart/form-data con boundary
      });

      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);

      // Actualizar avatar visible
      const imgEl  = document.getElementById('profileAvatarImg');
      const initEl = document.getElementById('profileAvatarInitials');
      const url    = URL.createObjectURL(selectedFile);
      if (imgEl) {
        imgEl.onload = () => { imgEl.style.display = 'block'; if (initEl) initEl.style.display = 'none'; };
        imgEl.src    = url;
      }

      doClose();
      showToast('¡Foto de perfil actualizada!', 'success');
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      btn.disabled       = false;
      txt.style.display  = '';
      spinner.style.display = 'none';
    }
  });
}

function openPhotoModal(user) {
  const modal   = document.getElementById('photoModal');
  if (!modal) { buildPhotoModal(user); }

  // Reset visual
  const prev    = document.getElementById('photoPreview');
  const initDiv = document.getElementById('photoPreviewInit');
  const saveBtn = document.getElementById('photoSaveBtn');
  const fi      = document.getElementById('photoFileInput');

  if (prev)   { prev.src = ''; prev.style.display = 'none'; }
  if (initDiv) initDiv.style.display = 'flex';
  if (saveBtn) saveBtn.disabled = true;
  if (fi)      fi.value = '';

  // Pre-cargar foto actual si el usuario ya tiene una
  const curImg = document.getElementById('profileAvatarImg');
  if (curImg && curImg.src && curImg.style.display !== 'none') {
    if (prev) { prev.src = curImg.src; prev.style.display = 'block'; }
    if (initDiv) initDiv.style.display = 'none';
    // Guardar no se habilita hasta que elija un archivo nuevo
  }

  document.getElementById('photoModal').classList.add('open');
}

/* ══════════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info', duration = 3500) {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer'; c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${icons[type]||icons.info}<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastIn .25s ease reverse forwards';
    setTimeout(() => t.remove(), 250);
  }, duration);
}

/* ── Confirm Dialog ── */
function showConfirm(title, text) {
  return new Promise(resolve => {
    let overlay = document.getElementById('confirmOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'confirmOverlay'; overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <p class="confirm-title" id="confirmTitle"></p>
          <p class="confirm-text"  id="confirmText"></p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" id="confirmCancel">Cancelar</button>
            <button class="btn btn-danger"    id="confirmOk">Eliminar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent  = text;
    overlay.classList.add('open');
    const cleanup = (r) => {
      overlay.classList.remove('open');
      document.getElementById('confirmOk').replaceWith(document.getElementById('confirmOk').cloneNode(true));
      document.getElementById('confirmCancel').replaceWith(document.getElementById('confirmCancel').cloneNode(true));
      resolve(r);
    };
    document.getElementById('confirmOk').addEventListener('click',    () => cleanup(true),  { once: true });
    document.getElementById('confirmCancel').addEventListener('click', () => cleanup(false), { once: true });
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(false); }, { once: true });
  });
}

/* ── Modal helpers ── */
function openModal(id)  { document.getElementById(id)?.classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow = ''; }

/* ── API helper ── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) { const t = await res.text(); throw new Error(t || `Error ${res.status}`); }
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

/* ── Formatters ── */
function formatCurrency(val) {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-GT',
    { day: '2-digit', month: 'short', year: 'numeric' });
}