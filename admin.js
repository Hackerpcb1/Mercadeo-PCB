// Verificar autenticación
if (!isAuthenticated()) {
  window.location.href = 'index.html';
}

// Cargar productos desde localStorage
function loadProducts() {
  const stored = localStorage.getItem('mercadeo_products');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Productos por defecto
  return [
    { id: 1, name: 'Chicles Trident', price: 0.50, emoji: '🎀', category: 'dulces', popular: true },
    { id: 2, name: 'Caramelos Halls', price: 0.75, emoji: '🍭', category: 'dulces', popular: false },
    { id: 3, name: 'Chocolate Hershey', price: 1.00, emoji: '🍫', category: 'chocolates', popular: true },
    { id: 4, name: 'Galletas Oreo', price: 1.25, emoji: '🍪', category: 'snacks', popular: true },
    { id: 5, name: 'Paleta Dum Dums', price: 0.25, emoji: '🍭', category: 'dulces', popular: false },
    { id: 6, name: 'Gomas Haribo', price: 1.50, emoji: '🍬', category: 'dulces', popular: true },
    { id: 7, name: 'Refresco Sprite', price: 1.50, emoji: '🥤', category: 'bebidas', popular: false },
    { id: 8, name: 'Doritos', price: 1.25, emoji: '🧡', category: 'snacks', popular: true },
    { id: 9, name: 'Papas Lays', price: 1.00, emoji: '🟡', category: 'snacks', popular: false },
    { id: 10, name: 'Wafers Krakers', price: 0.75, emoji: '🍘', category: 'snacks', popular: false },
    { id: 11, name: 'M&Ms', price: 1.00, emoji: '🌈', category: 'chocolates', popular: true },
    { id: 12, name: 'Coca Cola', price: 1.50, emoji: '🥤', category: 'bebidas', popular: true },
    { id: 13, name: 'Skittles', price: 1.25, emoji: '🌈', category: 'dulces', popular: false },
    { id: 14, name: 'Kit Kat', price: 1.00, emoji: '🍫', category: 'chocolates', popular: true }
  ];
}

function saveProducts(products) {
  localStorage.setItem('mercadeo_products', JSON.stringify(products));
}

let products = loadProducts();

function updateStats() {
  document.getElementById('total-products').textContent = products.length;
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
  document.getElementById('avg-price').textContent = `$${avgPrice.toFixed(2)}`;
}

function getCategoryName(category) {
  const names = {
    'dulces': '🍬 Dulces',
    'chocolates': '🍫 Chocolates',
    'bebidas': '🥤 Bebidas',
    'snacks': '🍿 Snacks'
  };
  return names[category] || category;
}

function renderProducts() {
  const tbody = document.getElementById('products-table-body');
  
  tbody.innerHTML = products.map(product => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td class="px-6 py-4 text-2xl">${product.emoji}</td>
      <td class="px-6 py-4 font-semibold">${product.name}</td>
      <td class="px-6 py-4 text-sm">${getCategoryName(product.category)}</td>
      <td class="px-6 py-4 font-bold text-[#f59e0b]">$${product.price.toFixed(2)}</td>
      <td class="px-6 py-4">
        ${product.popular ? '<span class="text-xs bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-1 rounded-full font-semibold">⭐ Popular</span>' : '-'}
      </td>
      <td class="px-6 py-4">
        <div class="flex gap-2">
          <button onclick="editProduct(${product.id})" 
            class="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-400/10 rounded"
            title="Editar">
            ✏️
          </button>
          <button onclick="deleteProduct(${product.id})" 
            class="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-400/10 rounded"
            title="Eliminar">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  updateStats();
}

function showAddProductModal() {
  document.getElementById('modal-title').textContent = 'Añadir Producto';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal').classList.add('active');
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  document.getElementById('modal-title').textContent = 'Editar Producto';
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-emoji').value = product.emoji;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-popular').checked = product.popular;
  document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
}

function deleteProduct(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
  
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  renderProducts();
  showToast('🗑️ Producto eliminado', 'info');
}

// Form submit
document.getElementById('product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const id = document.getElementById('product-id').value;
  const productData = {
    name: document.getElementById('product-name').value,
    emoji: document.getElementById('product-emoji').value,
    price: parseFloat(document.getElementById('product-price').value),
    category: document.getElementById('product-category').value,
    popular: document.getElementById('product-popular').checked
  };
  
  if (id) {
    // Editar producto existente
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      showToast('✅ Producto actualizado', 'success');
    }
  } else {
    // Añadir nuevo producto
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    products.push({ id: newId, ...productData });
    showToast('✅ Producto añadido', 'success');
  }
  
  saveProducts(products);
  renderProducts();
  closeProductModal();
});

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Inicializar
renderProducts();

