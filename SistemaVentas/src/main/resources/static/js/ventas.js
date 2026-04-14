// ============================================
// VENTAS — ventas.js
// ============================================

let allVentas   = [];
let allClientes = [];
let allUsuarios = [];
let editingId   = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDependencies();
  await loadVentas();
  setupSearch();
  setupForm();
  setupFilterChips();

  document.getElementById('btnNuevaVenta')?.addEventListener('click', openCreateModal);
  document.getElementById('modalClose')?.addEventListener('click', () => closeModal('ventaModal'));
  document.getElementById('btnCancelForm')?.addEventListener('click', () => closeModal('ventaModal'));
});

async function loadDependencies() {
  try {
    [allClientes, allUsuarios] = await Promise.all([
      apiFetch('/clientes'),
      apiFetch('/usuarios'),
    ]);
    populateSelects();
  } catch (err) {
    showToast('Error cargando dependencias: ' + err.message, 'error');
  }
}

function populateSelects() {
  const selCliente = document.getElementById('fieldCliente');
  const selUsuario = document.getElementById('fieldUsuario');
  if (selCliente) {
    selCliente.innerHTML = `<option value="">-- Selecciona cliente --</option>` +
      allClientes.filter(c => c.estado === 1).map(c =>
        `<option value="${c.dpiCliente}">${c.nombreCliente} ${c.apellidoCliente}</option>`
      ).join('');
  }
  if (selUsuario) {
    selUsuario.innerHTML = `<option value="">-- Selecciona usuario --</option>` +
      allUsuarios.filter(u => u.estado === 1).map(u =>
        `<option value="${u.codigoUsuario}">${u.username} (${u.rol})</option>`
      ).join('');
  }
}

async function loadVentas() {
  showTableLoading();
  try {
    allVentas = await apiFetch('/ventas');
    renderTable(allVentas);
    document.getElementById('rowCount').textContent = `${allVentas.length} registros`;
  } catch (err) {
    showToast('Error al cargar ventas: ' + err.message, 'error');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('ventasTbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <p>No hay ventas registradas</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(v => {
    const clienteNombre = v.cliente
      ? `${v.cliente.nombreCliente} ${v.cliente.apellidoCliente}`
      : `DPI ${v.clientes_dpi_cliente || '—'}`;
    const usuarioNombre = v.usuario ? v.usuario.username : '—';
    return `
    <tr class="fade-up">
      <td><span class="code-cell">#${v.codigoVenta}</span></td>
      <td>${formatDate(v.fechaVenta)}</td>
      <td>${clienteNombre}</td>
      <td style="color:var(--text-muted)">${usuarioNombre}</td>
      <td><span class="price-cell">${formatCurrency(v.total)}</span></td>
      <td>${v.estado === 1
        ? `<span class="badge badge-green">Activa</span>`
        : `<span class="badge badge-red">Anulada</span>`}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="openEditModal(${v.codigoVenta})">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteVenta(${v.codigoVenta})">
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
  document.getElementById('ventasTbody').innerHTML = `
    <tr><td colspan="7" style="text-align:center;padding:40px">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text-muted)">
        <div class="spinner"></div> Cargando...
      </div>
    </td></tr>`;
}

function openCreateModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nueva Venta';
  document.getElementById('ventaForm').reset();
  document.getElementById('fieldFecha').value = new Date().toISOString().split('T')[0];
  openModal('ventaModal');
}

function openEditModal(id) {
  const v = allVentas.find(x => x.codigoVenta === id);
  if (!v) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Editar Venta';
  document.getElementById('fieldFecha').value   = v.fechaVenta || '';
  document.getElementById('fieldTotal').value   = v.total;
  document.getElementById('fieldEstado').value  = v.estado;
  if (v.cliente) document.getElementById('fieldCliente').value = v.cliente.dpiCliente;
  if (v.usuario) document.getElementById('fieldUsuario').value = v.usuario.codigoUsuario;
  openModal('ventaModal');
}

function setupForm() {
  document.getElementById('ventaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      fechaVenta: document.getElementById('fieldFecha').value,
      total:      parseFloat(document.getElementById('fieldTotal').value),
      estado:     parseInt(document.getElementById('fieldEstado').value),
      cliente:    { dpiCliente: parseInt(document.getElementById('fieldCliente').value) },
      usuario:    { codigoUsuario: parseInt(document.getElementById('fieldUsuario').value) },
    };

    try {
      if (editingId) {
        await apiFetch(`/ventas/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Venta actualizada.', 'success');
      } else {
        await apiFetch('/ventas', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Venta creada.', 'success');
      }
      closeModal('ventaModal');
      loadVentas();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });
}

async function deleteVenta(id) {
  const ok = await showConfirm('¿Eliminar venta?', `Se eliminará la venta #${id}. Esta acción no se puede deshacer.`);
  if (!ok) return;
  try {
    await apiFetch(`/ventas/${id}`, { method: 'DELETE' });
    showToast('Venta eliminada.', 'success');
    loadVentas();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function setupSearch() {
  document.getElementById('searchInput')?.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const filtered = allVentas.filter(v =>
      String(v.codigoVenta).includes(q) ||
      v.fechaVenta?.includes(q) ||
      v.cliente?.nombreCliente?.toLowerCase().includes(q) ||
      v.cliente?.apellidoCliente?.toLowerCase().includes(q) ||
      v.usuario?.username?.toLowerCase().includes(q)
    );
    renderTable(filtered);
    document.getElementById('rowCount').textContent = `${filtered.length} de ${allVentas.length} registros`;
  });
}

function setupFilterChips() {
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.chip[data-filter]').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      let filtered = allVentas;
      if (f === 'activa')  filtered = allVentas.filter(v => v.estado === 1);
      if (f === 'anulada') filtered = allVentas.filter(v => v.estado !== 1);
      renderTable(filtered);
      document.getElementById('rowCount').textContent = `${filtered.length} de ${allVentas.length} registros`;
    });
  });
}
