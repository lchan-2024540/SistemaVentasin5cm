// ============================================
// USUARIOS — usuarios.js
// ============================================

let allUsuarios = [];
let editingId   = null;

document.addEventListener('DOMContentLoaded', () => {
  loadUsuarios();
  setupSearch();
  setupForm();
  setupFilterChips();
  setupPwToggle();

  document.getElementById('btnNuevoUsuario')?.addEventListener('click', openCreateModal);
  document.getElementById('modalClose')?.addEventListener('click', () => closeModal('usuarioModal'));
  document.getElementById('btnCancelForm')?.addEventListener('click', () => closeModal('usuarioModal'));
});

async function loadUsuarios() {
  showTableLoading();
  try {
    allUsuarios = await apiFetch('/usuarios');
    renderTable(allUsuarios);
    document.getElementById('rowCount').textContent = `${allUsuarios.length} registros`;
  } catch (err) {
    showToast('Error al cargar usuarios: ' + err.message, 'error');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('usuariosTbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <p>No hay usuarios registrados</p>
    </div></td></tr>`;
    return;
  }

  const rolColors = {
    administrador: 'badge-blue',
    vendedor:      'badge-green',
    cajero:        'badge-yellow',
  };

  tbody.innerHTML = data.map(u => {
    const rolClass = rolColors[u.rol?.toLowerCase()] || 'badge-blue';
    const initials = u.username.slice(0,2).toUpperCase();
    return `
    <tr class="fade-up">
      <td><span class="code-cell">#${u.codigoUsuario}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);
            border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;
            font-family:var(--font-display);font-size:.72rem;font-weight:700;color:var(--accent);flex-shrink:0">
            ${initials}
          </div>
          ${u.username}
        </div>
      </td>
      <td style="color:var(--text-muted)">${u.email || '—'}</td>
      <td><span class="badge ${rolClass}">${u.rol || '—'}</span></td>
      <td>${u.estado === 1
        ? `<span class="badge badge-green">Activo</span>`
        : `<span class="badge badge-red">Inactivo</span>`}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="openEditModal(${u.codigoUsuario})">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUsuario(${u.codigoUsuario})">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function showTableLoading() {
  document.getElementById('usuariosTbody').innerHTML = `
    <tr><td colspan="7" style="text-align:center;padding:40px">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text-muted)">
        <div class="spinner"></div> Cargando...
      </div>
    </td></tr>`;
}

function openCreateModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
  document.getElementById('usuarioForm').reset();
  document.getElementById('fieldPassword').placeholder = 'Contraseña';
  openModal('usuarioModal');
}

function openEditModal(id) {
  const u = allUsuarios.find(x => x.codigoUsuario === id);
  if (!u) return;
  editingId = id;
  document.getElementById('modalTitle').textContent  = 'Editar Usuario';
  document.getElementById('fieldUsername').value     = u.username;
  document.getElementById('fieldPassword').value     = u.password;
  document.getElementById('fieldEmail').value        = u.email || '';
  document.getElementById('fieldRol').value          = u.rol || '';
  document.getElementById('fieldEstado').value       = u.estado;
  openModal('usuarioModal');
}

function setupForm() {
  document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.getElementById('fieldUsername').value.trim(),
      password: document.getElementById('fieldPassword').value.trim(),
      email:    document.getElementById('fieldEmail').value.trim(),
      rol:      document.getElementById('fieldRol').value,
      estado:   parseInt(document.getElementById('fieldEstado').value),
    };

    try {
      if (editingId) {
        await apiFetch(`/usuarios/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Usuario actualizado.', 'success');
      } else {
        await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Usuario creado.', 'success');
      }
      closeModal('usuarioModal');
      loadUsuarios();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });
}

async function deleteUsuario(id) {
  const current = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  if (current.id === id) {
    showToast('No puedes eliminar tu propia cuenta.', 'error');
    return;
  }
  const ok = await showConfirm('¿Eliminar usuario?', `Se eliminará el usuario #${id}. Esta acción no se puede deshacer.`);
  if (!ok) return;
  try {
    await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
    showToast('Usuario eliminado.', 'success');
    loadUsuarios();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function setupSearch() {
  document.getElementById('searchInput')?.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const filtered = allUsuarios.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.rol?.toLowerCase().includes(q)
    );
    renderTable(filtered);
    document.getElementById('rowCount').textContent = `${filtered.length} de ${allUsuarios.length} registros`;
  });
}

function setupFilterChips() {
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.chip[data-filter]').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      let filtered = allUsuarios;
      if (f === 'activo')        filtered = allUsuarios.filter(u => u.estado === 1);
      if (f === 'inactivo')      filtered = allUsuarios.filter(u => u.estado !== 1);
      if (f === 'administrador') filtered = allUsuarios.filter(u => u.rol === 'administrador');
      if (f === 'vendedor')      filtered = allUsuarios.filter(u => u.rol === 'vendedor');
      renderTable(filtered);
      document.getElementById('rowCount').textContent = `${filtered.length} de ${allUsuarios.length} registros`;
    });
  });
}

function setupPwToggle() {
  document.getElementById('pwToggle')?.addEventListener('click', function() {
    const pw  = document.getElementById('fieldPassword');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    this.innerHTML = show
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
}
