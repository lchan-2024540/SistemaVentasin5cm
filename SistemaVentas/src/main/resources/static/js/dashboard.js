// ============================================
// DASHBOARD — dashboard.js
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Set current date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-GT', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Greet by username
  const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const greetEl = document.getElementById('greetUser');
  if (greetEl) greetEl.textContent = user.username || 'Usuario';

  // Load stats concurrently
  try {
    const [clientes, productos, ventas, usuarios] = await Promise.all([
      apiFetch('/clientes'),
      apiFetch('/productos'),
      apiFetch('/ventas'),
      apiFetch('/usuarios'),
    ]);

    animateCount('statClientes', clientes.length);
    animateCount('statProductos', productos.length);
    animateCount('statVentas', ventas.length);
    animateCount('statUsuarios', usuarios.length);

    // Recent sales table
    const recentSales = [...ventas]
      .sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
      .slice(0, 5);
    renderRecentSales(recentSales);

    // Low stock products
    const lowStock = [...productos]
      .filter(p => p.stock <= 10 && p.estado === 1)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
    renderLowStock(lowStock);

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('No se pudieron cargar los datos del dashboard.', 'error');
  }
});

function animateCount(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 30);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 30);
}

function renderRecentSales(sales) {
  const tbody = document.getElementById('recentSalesTbody');
  if (!tbody) return;

  if (!sales.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:30px">
      Sin ventas recientes</td></tr>`;
    return;
  }

  tbody.innerHTML = sales.map(v => `
    <tr class="fade-up">
      <td><span class="code-cell">#${v.codigoVenta}</span></td>
      <td>${formatDate(v.fechaVenta)}</td>
      <td><span class="price-cell">${formatCurrency(v.total)}</span></td>
      <td>${v.estado === 1
        ? `<span class="badge badge-green">Activa</span>`
        : `<span class="badge badge-red">Inactiva</span>`}
      </td>
    </tr>
  `).join('');
}

function renderLowStock(products) {
  const tbody = document.getElementById('lowStockTbody');
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:30px">
      Todos los productos tienen stock suficiente</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const pct   = Math.min((p.stock / 20) * 100, 100);
    const cls   = p.stock <= 3 ? 'low' : p.stock <= 7 ? 'medium' : '';
    return `
      <tr class="fade-up">
        <td>${p.nombreProducto}</td>
        <td>
          <div class="stock-bar">
            <div class="stock-track">
              <div class="stock-fill ${cls}" style="width:${pct}%"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted)">${p.stock}</span>
          </div>
        </td>
        <td><span class="price-cell">${formatCurrency(p.precio)}</span></td>
      </tr>
    `;
  }).join('');
}
