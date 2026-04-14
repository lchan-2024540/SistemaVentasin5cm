// ============================================
// DETALLE VENTA — detalle-venta.js
// ============================================

let allDetalles  = [];
let allProductos = [];
let allVentas    = [];
let editingId    = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDependencies();
  await loadDetalles();
  setupSearch();
  setupForm();
  setupAutoCalc();

  document.getElementById('btnNuevoDetalle')?.addEventListener('click', openCreateModal);
  document.getElementById('modalClose')?.addEventListener('click', () => closeModal('detalleModal'));
  document.getElementById('btnCancelForm')?.addEventListener('click', () => closeModal('detalleModal'));
});

async function loadDependencies() {
  try {
    [allProductos, allVentas] = await Promise.all([
      apiFetch('/productos'),
      apiFetch('/ventas'),
    ]);
    populateSelects();
  } catch (err) {
    showToast('Error cargando dependencias: ' + err.message, 'error');
  }
}

function populateSelects() {
  const selProducto = document.getElementById('fieldProducto');
  const selVenta    = document.getElementById('fieldVenta');

  if (selProducto) {
    selProducto.innerHTML = `<option value="">-- Selecciona producto --</option>` +
      allProductos.filter(p => p.estado === 1).map(p =>
        `<option value="${p.codigoProducto}" data-precio="${p.precio}">${p.nombreProducto} (${formatCurrency(p.precio)})</option>`
      ).join('');
  }
  if (selVenta) {
    selVenta.innerHTML = `<option value="">-- Selecciona venta --</option>` +
      allVentas.filter(v => v.estado === 1).map(v =>
        `<option value="${v.codigoVenta}">Venta #${v.codigoVenta} — ${formatDate(v.fechaVenta)}</option>`
      ).join('');
  }
}

async function loadDetalles() {
  showTableLoading();
  try {
    allDetalles = await apiFetch('/detalle-venta');
    renderTable(allDetalles);
    document.getElementById('rowCount').textContent = `${allDetalles.length} registros`;
  } catch (err) {
    showToast('Error al cargar detalles: ' + err.message, 'error');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('detallesTbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <p>No hay detalles de venta registrados</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(d => {
    const productoNombre = d.producto?.nombreProducto || `#${d.productos_codigo_producto || '—'}`;
    const ventaId        = d.venta?.codigoVenta || '—';
    return `
    <tr class="fade-up">
      <td><span class="code-cell">#${d.codigoDetalleVenta}</span></td>
      <td><span class="code-cell">Venta #${ventaId}</span></td>
      <td>${productoNombre}</td>
      <td style="font-family:var(--font-mono);text-align:center">${d.cantidad}</td>
      <td><span class="price-cell">${formatCurrency(d.precioUnitario)}</span></td>
      <td><span class="price-cell" style="color:var(--yellow)">${formatCurrency(d.subtotal)}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="openEditModal(${d.codigoDetalleVenta})">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteDetalle(${d.codigoDetalleVenta})">
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
  document.getElementById('detallesTbody').innerHTML = `
    <tr><td colspan="7" style="text-align:center;padding:40px">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text-muted)">
        <div class="spinner"></div> Cargando...
      </div>
    </td></tr>`;
}

function openCreateModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Detalle de Venta';
  document.getElementById('detalleForm').reset();
  openModal('detalleModal');
}

function openEditModal(id) {
  const d = allDetalles.find(x => x.codigoDetalleVenta === id);
  if (!d) return;
  editingId = id;
  document.getElementById('modalTitle').textContent    = 'Editar Detalle de Venta';
  document.getElementById('fieldCantidad').value       = d.cantidad;
  document.getElementById('fieldPrecioUnitario').value = d.precioUnitario;
  document.getElementById('fieldSubtotal').value       = d.subtotal;
  if (d.producto) document.getElementById('fieldProducto').value = d.producto.codigoProducto;
  if (d.venta)    document.getElementById('fieldVenta').value    = d.venta.codigoVenta;
  openModal('detalleModal');
}

function setupForm() {
  document.getElementById('detalleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      cantidad:       parseInt(document.getElementById('fieldCantidad').value),
      precioUnitario: parseFloat(document.getElementById('fieldPrecioUnitario').value),
      subtotal:       parseFloat(document.getElementById('fieldSubtotal').value),
      producto:       { codigoProducto: parseInt(document.getElementById('fieldProducto').value) },
      venta:          { codigoVenta:    parseInt(document.getElementById('fieldVenta').value) },
    };

    try {
      if (editingId) {
        await apiFetch(`/detalle-venta/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Detalle actualizado.', 'success');
      } else {
        await apiFetch('/detalle-venta', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Detalle creado.', 'success');
      }
      closeModal('detalleModal');
      loadDetalles();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });
}

// Auto-calculate subtotal when qty or price changes
function setupAutoCalc() {
  const cantidadEl = document.getElementById('fieldCantidad');
  const precioEl   = document.getElementById('fieldPrecioUnitario');
  const subEl      = document.getElementById('fieldSubtotal');
  const productoEl = document.getElementById('fieldProducto');

  function recalc() {
    const qty   = parseFloat(cantidadEl?.value) || 0;
    const price = parseFloat(precioEl?.value)   || 0;
    if (subEl) subEl.value = (qty * price).toFixed(2);
  }

  cantidadEl?.addEventListener('input', recalc);
  precioEl?.addEventListener('input', recalc);

  // Auto-fill price when product selected
  productoEl?.addEventListener('change', function() {
    const opt = this.options[this.selectedIndex];
    const precio = opt?.dataset?.precio;
    if (precio && precioEl) {
      precioEl.value = precio;
      recalc();
    }
  });
}

async function deleteDetalle(id) {
  const ok = await showConfirm('¿Eliminar detalle?', `Se eliminará el detalle #${id}. Esta acción no se puede deshacer.`);
  if (!ok) return;
  try {
    await apiFetch(`/detalle-venta/${id}`, { method: 'DELETE' });
    showToast('Detalle eliminado.', 'success');
    loadDetalles();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function setupSearch() {
  document.getElementById('searchInput')?.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const filtered = allDetalles.filter(d =>
      String(d.codigoDetalleVenta).includes(q) ||
      d.producto?.nombreProducto?.toLowerCase().includes(q) ||
      String(d.venta?.codigoVenta || '').includes(q)
    );
    renderTable(filtered);
    document.getElementById('rowCount').textContent = `${filtered.length} de ${allDetalles.length} registros`;
  });
}
