// ============================================
// CLIENTES — clientes.js
// ============================================

let allClientes = [];
let editingId   = null;

document.addEventListener('DOMContentLoaded', () => {
  loadClientes();
  setupSearch();
  setupForm();
  setupFilterChips();

  document.getElementById('btnNuevoCliente')?.addEventListener('click', openCreateModal);
  document.getElementById('modalClose')?.addEventListener('click', () => closeModal('clienteModal'));
  document.getElementById('btnCancelForm')?.addEventListener('click', () => closeModal('clienteModal'));
  document.querySelector('#clienteModal .modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal('clienteModal');
  });
});

async function loadClientes() {
  showTableLoading();
  try {
    allClientes = await apiFetch('/clientes');
    renderTable(allClientes);
    document.getElementById('rowCount').textContent = `${allClientes.length} registros`;
  } catch (err) {
    showToast('Error al cargar clientes: ' + err.message, 'error');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('clientesTbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>No hay clientes registrados</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr class="fade-up">
      <td><span class="code-cell">${c.dpiCliente}</span></td>
      <td>${c.nombreCliente}</td>
      <td>${c.apellidoCliente}</td>
      <td style="color:var(--text-muted)">${c.direccion || '—'}</td>
      <td>${c.estado === 1
        ? `<span class="badge badge-green">Activo</span>`
        : `<span class="badge badge-red">Inactivo</span>`}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="openEditModal(${c.dpiCliente})" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteCliente(${c.dpiCliente})" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function showTableLoading() {
  document.getElementById('clientesTbody').innerHTML = `
    <tr><td colspan="7" style="text-align:center;padding:40px">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text-muted)">
        <div class="spinner"></div> Cargando...
      </div>
    </td></tr>`;
}

function openCreateModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Cliente';
  document.getElementById('clienteForm').reset();
  document.getElementById('fieldDpi').disabled = false;
  openModal('clienteModal');
}

function openEditModal(dpi) {
  const c = allClientes.find(x => x.dpiCliente === dpi);
  if (!c) return;
  editingId = dpi;
  document.getElementById('modalTitle').textContent = 'Editar Cliente';
  document.getElementById('fieldDpi').value           = c.dpiCliente;
  document.getElementById('fieldDpi').disabled        = true;
  document.getElementById('fieldNombre').value        = c.nombreCliente;
  document.getElementById('fieldApellido').value      = c.apellidoCliente;
  document.getElementById('fieldDireccion').value     = c.direccion || '';
  document.getElementById('fieldEstado').value        = c.estado;
  openModal('clienteModal');
}

function setupForm() {
  document.getElementById('clienteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dpi       = parseInt(document.getElementById('fieldDpi').value);
    const payload   = {
      dpiCliente:      dpi,
      nombreCliente:   document.getElementById('fieldNombre').value.trim(),
      apellidoCliente: document.getElementById('fieldApellido').value.trim(),
      direccion:       document.getElementById('fieldDireccion').value.trim(),
      estado:          parseInt(document.getElementById('fieldEstado').value),
    };

    try {
      if (editingId) {
        await apiFetch(`/clientes/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Cliente actualizado correctamente.', 'success');
      } else {
        await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Cliente creado correctamente.', 'success');
      }
      closeModal('clienteModal');
      loadClientes();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });
}

async function deleteCliente(dpi) {
  const ok = await showConfirm('¿Eliminar cliente?', `Se eliminará el cliente con DPI ${dpi}. Esta acción no se puede deshacer.`);
  if (!ok) return;
  try {
    await apiFetch(`/clientes/${dpi}`, { method: 'DELETE' });
    showToast('Cliente eliminado.', 'success');
    loadClientes();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, 'error');
  }
}

function setupSearch() {
  document.getElementById('searchInput')?.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const filtered = allClientes.filter(c =>
      String(c.dpiCliente).includes(q) ||
      c.nombreCliente?.toLowerCase().includes(q) ||
      c.apellidoCliente?.toLowerCase().includes(q) ||
      c.direccion?.toLowerCase().includes(q)
    );
    renderTable(filtered);
    document.getElementById('rowCount').textContent = `${filtered.length} de ${allClientes.length} registros`;
  });
}

function setupFilterChips() {
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.chip[data-filter]').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      let filtered = allClientes;
      if (f === 'activo')   filtered = allClientes.filter(c => c.estado === 1);
      if (f === 'inactivo') filtered = allClientes.filter(c => c.estado !== 1);
      renderTable(filtered);
      document.getElementById('rowCount').textContent = `${filtered.length} de ${allClientes.length} registros`;
    });
  });
}
