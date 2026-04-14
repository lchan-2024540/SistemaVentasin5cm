// ============================================
// PRODUCTOS — productos.js
// ============================================

let allProductos = [];
let editingId    = null;

document.addEventListener('DOMContentLoaded', () => {
  loadProductos();
  setupSearch();
  setupForm();
  setupFilterChips();

  document.getElementById('btnNuevoProducto')?.addEventListener('click', openCreateModal);
  document.getElementById('modalClose')?.addEventListener('click', () => closeModal('productoModal'));
  document.getElementById('btnCancelForm')?.addEventListener('click', () => closeModal('productoModal'));
});

async function loadProductos() {
  showTableLoading();
  try {
    allProductos = await apiFetch('/productos');
    renderTable(allProductos);
    document.getElementById('rowCount').textContent = `${allProductos.length} registros`;
  } catch (err) {
    showToast('Error al cargar productos: ' + err.message, 'error');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('productosTbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <p>No hay productos registrados</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(p => {
    const pct = Math.min((p.stock / 20) * 100, 100);
    const cls = p.stock <= 3 ? 'low' : p.stock <= 7 ? 'medium' : '';
    return `
    <tr class="fade-up">
      <td><span class="code-cell">#${p.codigoProducto}</span></td>
      <td>${p.nombreProducto}</td>
      <td><span class="price-cell">${formatCurrency(p.precio)}</span></td>
      <td>
        <div class="stock-bar">
          <div class="stock-track"><div class="stock-fill ${cls}" style="width:${pct}%"></div></div>
          <span style="font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted)">${p.stock}</span>
        </div>
      </td>
      <td>${p.estado === 1
        ? `<span class="badge badge-green">Activo</span>`
        : `<span class="badge badge-red">Inactivo</span>`}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="openEditModal(${p.codigoProducto})">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteProducto(${p.codigoProducto})">
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
  document.getElementById('productosTbody').innerHTML = `
    <tr><td colspan="7" style="text-align:center;padding:40px">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text-muted)">
        <div class="spinner"></div> Cargando...
      </div>
    </td></tr>`;
}

function openCreateModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  document.getElementById('productoForm').reset();
  openModal('productoModal');
}

function openEditModal(id) {
  const p = allProductos.find(x => x.codigoProducto === id);
  if (!p) return;
  editingId = id;
  document.getElementById('modalTitle').textContent     = 'Editar Producto';
  document.getElementById('fieldNombre').value          = p.nombreProducto;
  document.getElementById('fieldPrecio').value          = p.precio;
  document.getElementById('fieldStock').value           = p.stock;
  document.getElementById('fieldEstado').value          = p.estado;
  openModal('productoModal');
}

function setupForm() {
  document.getElementById('productoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nombreProducto: document.getElementById('fieldNombre').value.trim(),
      precio:         parseFloat(document.getElementById('fieldPrecio').value),
      stock:          parseInt(document.getElementById('fieldStock').value),
      estado:         parseInt(document.getElementById('fieldEstado').value),
    };

    try {
      if (editingId) {
        await apiFetch(`/productos/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Producto actualizado.', 'success');
      } else {
        await apiFetch('/productos', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Producto creado.', 'success');
      }
      closeModal('productoModal');
      loadProductos();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });
}

async function deleteProducto(id) {
  const ok = await showConfirm('¿Eliminar producto?', `Se eliminará el producto #${id}. Esta acción no se puede deshacer.`);
  if (!ok) return;
  try {
    await apiFetch(`/productos/${id}`, { method: 'DELETE' });
    showToast('Producto eliminado.', 'success');
    loadProductos();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function setupSearch() {
  document.getElementById('searchInput')?.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const filtered = allProductos.filter(p =>
      p.nombreProducto?.toLowerCase().includes(q) ||
      String(p.codigoProducto).includes(q)
    );
    renderTable(filtered);
    document.getElementById('rowCount').textContent = `${filtered.length} de ${allProductos.length} registros`;
  });
}

function setupFilterChips() {
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.chip[data-filter]').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      let filtered = allProductos;
      if (f === 'activo')     filtered = allProductos.filter(p => p.estado === 1);
      if (f === 'inactivo')   filtered = allProductos.filter(p => p.estado !== 1);
      if (f === 'bajo-stock') filtered = allProductos.filter(p => p.stock <= 5);
      renderTable(filtered);
      document.getElementById('rowCount').textContent = `${filtered.length} de ${allProductos.length} registros`;
    });
  });
}
