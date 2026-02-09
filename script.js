const defaultConfig = {
  store_name: 'Mercadeo',
  tagline: 'Selecciona tus dulces favoritos y nosotros te los llevamos al salón',
  delivery_cost: 2,
  delivery_hours: '9:00 AM - 2:00 PM',
  primary_color: '#1e40af',
  secondary_color: '#3b82f6',
  accent_color: '#f59e0b',
  background_color: '#0f172a'
};

let config = { ...defaultConfig };

// Theme Management - Ahora manejado por el menú hamburguesa

// Cargar productos desde localStorage o usar por defecto
function loadCandies() {
  const stored = localStorage.getItem('mercadeo_products');
  if (stored) {
    return JSON.parse(stored);
  }

  return [
    { id: 1, name: 'Chicles Trident', price: 0.50, emoji: '🎀', category: 'dulces', popular: true, nutrition: { calories: 5, sugar: 0, fat: 0, protein: 0 } },
    { id: 2, name: 'Caramelos Halls', price: 0.75, emoji: '🍭', category: 'dulces', popular: false, nutrition: { calories: 15, sugar: 4, fat: 0, protein: 0 } },
    { id: 3, name: 'Chocolate Hershey', price: 1.00, emoji: '🍫', category: 'chocolates', popular: true, nutrition: { calories: 220, sugar: 25, fat: 13, protein: 3 } },
    { id: 4, name: 'Galletas Oreo', price: 1.25, emoji: '🍪', category: 'snacks', popular: true, nutrition: { calories: 160, sugar: 14, fat: 7, protein: 2 } },
    { id: 5, name: 'Paleta Dum Dums', price: 0.25, emoji: '🍭', category: 'dulces', popular: false, nutrition: { calories: 25, sugar: 6, fat: 0, protein: 0 } },
    { id: 6, name: 'Gomas Haribo', price: 1.50, emoji: '🍬', category: 'dulces', popular: true, nutrition: { calories: 140, sugar: 21, fat: 0, protein: 2 } },
    { id: 7, name: 'Refresco Sprite', price: 1.50, emoji: '🥤', category: 'bebidas', popular: false, nutrition: { calories: 140, sugar: 38, fat: 0, protein: 0 } },
    { id: 8, name: 'Doritos', price: 1.25, emoji: '🧡', category: 'snacks', popular: true, nutrition: { calories: 150, sugar: 1, fat: 8, protein: 2 } },
    { id: 9, name: 'Papas Lays', price: 1.00, emoji: '🟡', category: 'snacks', popular: false, nutrition: { calories: 160, sugar: 0, fat: 10, protein: 2 } },
    { id: 10, name: 'Wafers Krakers', price: 0.75, emoji: '🍘', category: 'snacks', popular: false, nutrition: { calories: 130, sugar: 8, fat: 6, protein: 1 } },
    { id: 11, name: 'M&Ms', price: 1.00, emoji: '🌈', category: 'chocolates', popular: true, nutrition: { calories: 240, sugar: 31, fat: 10, protein: 2 } },
    { id: 12, name: 'Coca Cola', price: 1.50, emoji: '🥤', category: 'bebidas', popular: true, nutrition: { calories: 140, sugar: 39, fat: 0, protein: 0 } },
    { id: 13, name: 'Skittles', price: 1.25, emoji: '🌈', category: 'dulces', popular: false, nutrition: { calories: 250, sugar: 47, fat: 2.5, protein: 0 } },
    { id: 14, name: 'Kit Kat', price: 1.00, emoji: '🍫', category: 'chocolates', popular: true, nutrition: { calories: 210, sugar: 22, fat: 11, protein: 3 } }
  ];
}

let candies = loadCandies();

// Estado del carrito y filtros
let cart = {};
let deliveryCost = parseFloat(config.delivery_cost) || 2;
let currentFilter = 'todos';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let splitCount = 1;
let isSplitActive = false;

// Estado del carrusel
let currentSlide = 0;
let carouselInterval = null;

// Estado del reconocimiento de voz
let recognition = null;
let isListening = false;

// Data SDK Handler
const dataHandler = {
  onDataChanged(data) {
    // Manejo de cambios de datos desde el backend
  }
};

// Funciones del Carrito
function addToCart(candy, quantity = 1) {
  const qty = parseInt(quantity) || 1;

  if (qty <= 0) {
    delete cart[candy.id];
  } else {
    // Si ya existe en el carrito, sumar la cantidad
    if (cart[candy.id]) {
      cart[candy.id].quantity += qty;
    } else {
      cart[candy.id] = { ...candy, quantity: qty };
    }
  }

  updateCart();
  updateProductBadges(); // Solo actualizar badges, no recargar todo
  showToast(`✅ ${candy.name} añadido al carrito`, 'success');

  // Enviar notificación
  addNotification(
    '🛒 Producto añadido',
    `${candy.name} (${qty}x) - $${(candy.price * qty).toFixed(2)}`,
    'success',
    candy.emoji
  );

  // Animación del botón
  const btn = event?.target?.closest('.candy-card');
  if (btn) {
    btn.classList.add('pulse-animation');
    setTimeout(() => btn.classList.remove('pulse-animation'), 600);
  }
}

function updateQuantity(candyId, quantity) {
  const qty = parseInt(quantity) || 1;
  if (qty <= 0) {
    removeFromCart(candyId);
  } else if (cart[candyId]) {
    cart[candyId].quantity = qty;
    updateCart();
    updateProductBadges(); // Actualizar badges sin recargar productos
  }
}

function removeFromCart(candyId) {
  const item = cart[candyId];
  delete cart[candyId];
  updateCart();
  updateProductBadges(); // Actualizar badges sin recargar productos
  if (item) {
    showToast(`🗑️ ${item.name} eliminado del carrito`, 'info');
  }
}

function clearCart() {
  if (Object.keys(cart).length === 0) return;

  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    cart = {};
    updateCart();
    updateProductBadges(); // Actualizar badges sin recargar productos
    showToast('🗑️ Carrito vaciado', 'info');
  }
}

function toggleFavorite(candyId) {
  const index = favorites.indexOf(candyId);
  if (index > -1) {
    favorites.splice(index, 1);
    showToast('💔 Eliminado de favoritos', 'info');
  } else {
    favorites.push(candyId);
    showToast('❤️ Añadido a favoritos', 'success');
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderCandies();
}

function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartCountMobile = document.getElementById('cart-count-mobile');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total-price');
  const clearBtn = document.getElementById('clear-cart-btn');
  const toggleSplitBtn = document.getElementById('toggle-split-btn');

  const items = Object.values(cart);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryCost;

  cartCount.textContent = itemCount;
  cartCountMobile.textContent = itemCount;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  if (items.length === 0) {
    cartItems.innerHTML = '<p class="text-gray-400 text-sm text-center py-8">Tu carrito está vacío</p>';
    clearBtn.classList.add('hidden');
    toggleSplitBtn.classList.add('hidden');
    return;
  }

  clearBtn.classList.remove('hidden');
  toggleSplitBtn.classList.remove('hidden');

  // Actualizar split si está activo
  if (isSplitActive) {
    updateSplitAmount(total);
  }

  cartItems.innerHTML = items.map(item => `
    <div class="cart-item bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <p class="font-semibold text-sm">${item.emoji} ${item.name}</p>
          <p class="text-xs text-gray-400">$${item.price.toFixed(2)} c/u</p>
        </div>
        <button onclick="removeFromCart(${item.id})"
          class="text-red-400 hover:text-red-300 transition-colors text-lg hover:scale-110"
          title="Eliminar">
          ✕
        </button>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-lg font-bold">
            −
          </button>
          <input type="number" value="${item.quantity}" min="1" max="99"
            class="w-12 text-center bg-transparent text-white font-semibold text-sm"
            onchange="updateQuantity(${item.id}, this.value)"
            onclick="this.select()">
          <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})"
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-lg font-bold">
            +
          </button>
        </div>
        <span class="font-bold text-[#f59e0b]">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function getFilteredCandies() {
  let filtered = candies;

  // Filtrar por categoría
  if (currentFilter !== 'todos') {
    filtered = filtered.filter(candy => candy.category === currentFilter);
  }

  // Filtrar por búsqueda
  if (searchQuery) {
    filtered = filtered.filter(candy =>
      candy.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return filtered;
}

function renderCandies() {
  const grid = document.getElementById('candies-grid');
  const noResults = document.getElementById('no-results');
  const productsCount = document.getElementById('products-count');

  const filtered = getFilteredCandies();

  if (filtered.length === 0) {
    grid.classList.add('hidden');
    noResults.classList.remove('hidden');
    productsCount.textContent = '0';
    return;
  }

  grid.classList.remove('hidden');
  noResults.classList.add('hidden');
  productsCount.textContent = filtered.length;

  grid.innerHTML = filtered.map((candy, idx) => {
    const isFavorite = favorites.includes(candy.id);
    const inCart = cart[candy.id];

    return `
    <div class="candy-card glass-card rounded-xl p-5 border border-white/10 hover:border-[#3b82f6] group transition-all duration-300"
      style="animation-delay: ${idx * 0.05}s">
      <div class="flex items-start justify-between mb-3">
        <span class="text-4xl group-hover:scale-110 transition-transform">${candy.emoji}</span>
        <div class="flex gap-2">
          ${candy.popular ? '<span class="text-xs bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-1 rounded-full font-semibold">Popular</span>' : ''}
          <button onclick="event.stopPropagation(); toggleFavorite(${candy.id})"
            class="text-xl hover:scale-125 transition-transform"
            title="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
            ${isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
      <h4 class="font-semibold mb-1" style="color: var(--text-primary);">${candy.name}</h4>
      <p class="text-xs mb-2 capitalize" style="color: var(--text-secondary);">${getCategoryName(candy.category)}</p>
      <p class="price-tag font-bold text-lg mb-3">$${candy.price.toFixed(2)}</p>

      ${inCart ? `
        <div class="bg-[#3b82f6]/20 border border-[#3b82f6] rounded-lg p-2 mb-2 text-center">
          <span class="text-xs text-[#3b82f6] font-semibold">✓ ${inCart.quantity} en el carrito</span>
        </div>
      ` : ''}

      <button onclick="addToCart({id: ${candy.id}, name: '${candy.name}', price: ${candy.price}, emoji: '${candy.emoji}', category: '${candy.category}'})"
        class="w-full btn-primary text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 group-hover:shadow-lg">
        <span>🛒</span>
        <span>Añadir al Carrito</span>
      </button>
    </div>
  `}).join('');
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

// Actualizar solo los badges de productos sin recargar toda la vista
function updateProductBadges() {
  const candyCards = document.querySelectorAll('.candy-card');

  candyCards.forEach(card => {
    // Obtener el botón de añadir al carrito para extraer el ID del producto
    const addButton = card.querySelector('button[onclick*="addToCart"]');
    if (!addButton) return;

    // Extraer el ID del producto del onclick
    const onclickAttr = addButton.getAttribute('onclick');
    const idMatch = onclickAttr.match(/id:\s*(\d+)/);
    if (!idMatch) return;

    const candyId = parseInt(idMatch[1]);
    const inCart = cart[candyId];

    // Buscar o crear el contenedor del badge
    let badgeContainer = card.querySelector('.cart-badge-container');

    if (inCart && inCart.quantity > 0) {
      // Si el producto está en el carrito, mostrar/actualizar el badge
      if (!badgeContainer) {
        // Crear el badge si no existe
        badgeContainer = document.createElement('div');
        badgeContainer.className = 'cart-badge-container bg-[#3b82f6]/20 border border-[#3b82f6] rounded-lg p-2 mb-2 text-center';
        badgeContainer.innerHTML = `<span class="text-xs text-[#3b82f6] font-semibold">✓ ${inCart.quantity} en el carrito</span>`;

        // Insertar antes del botón de añadir al carrito
        addButton.parentNode.insertBefore(badgeContainer, addButton);
      } else {
        // Actualizar el badge existente
        badgeContainer.innerHTML = `<span class="text-xs text-[#3b82f6] font-semibold">✓ ${inCart.quantity} en el carrito</span>`;
      }
    } else {
      // Si el producto no está en el carrito, eliminar el badge si existe
      if (badgeContainer) {
        badgeContainer.remove();
      }
    }
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function showConfirmation(orderData) {
  const modal = document.getElementById('confirmation-modal');
  const details = document.getElementById('confirmation-details');

  let splitInfo = '';
  if (orderData.splitCount && orderData.splitCount > 1) {
    splitInfo = `
      <div class="border-t border-white/10 pt-2 mt-2">
        <p class="text-xs text-gray-400 mb-1">👥 Dividido entre ${orderData.splitCount} personas</p>
        <p class="text-sm"><span class="text-gray-400">Cada uno paga:</span> <span class="font-bold text-[#10b981]">$${orderData.perPerson.toFixed(2)}</span></p>
      </div>
    `;
  }

  details.innerHTML = `
    <div class="space-y-2">
      <p><span class="text-gray-400">Nombre:</span> <span class="font-semibold">${orderData.nombre_completo}</span></p>
      <p><span class="text-gray-400">Grado/Grupo:</span> <span class="font-semibold">${orderData.grado}${orderData.grupo}</span></p>
      <p><span class="text-gray-400">Salón:</span> <span class="font-semibold">${orderData.salon}</span></p>
      <p><span class="text-gray-400">Teléfono:</span> <span class="font-semibold">${orderData.telefono}</span></p>
      <div class="border-t border-white/10 pt-2 mt-2">
        <p><span class="text-gray-400">Total:</span> <span class="font-bold text-[#f59e0b] text-lg">$${orderData.total.toFixed(2)}</span></p>
      </div>
      ${splitInfo}
    </div>
  `;

  modal.classList.add('active');

  // ¡Lanzar confetti! 🎉
  launchConfetti();

  // Actualizar estadísticas del usuario si está logueado
  if (currentUser) {
    const total = orderData.total;
    currentUser.totalSpent = (currentUser.totalSpent || 0) + total;
    currentUser.ordersCount = (currentUser.ordersCount || 0) + 1;

    // Actualizar en localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Actualizar en la lista de usuarios
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = currentUser;
      localStorage.setItem('users', JSON.stringify(users));
    }

    updateUserUI();
  }

  // Enviar notificación de pedido completado
  addNotification(
    '✅ ¡Pedido Confirmado!',
    `Tu pedido de $${orderData.total.toFixed(2)} ha sido procesado. ¡Gracias por tu compra!`,
    'success',
    '🎉'
  );
}

function resetForm() {
  document.getElementById('order-form').reset();
  cart = {};
  updateCart();
  document.getElementById('confirmation-modal').classList.remove('active');
}

// Event Listeners
document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (Object.keys(cart).length === 0) {
    showToast('Debes seleccionar al menos un dulce');
    return;
  }

  const nombre = document.getElementById('nombre').value;
  const grado = document.getElementById('grado').value;
  const grupo = document.getElementById('grupo').value;
  const salon = document.getElementById('salon').value;
  const telefono = document.getElementById('telefono').value;

  const items = Object.values(cart);
  const dulcesTexto = items.map(item => `${item.quantity}x ${item.name}`).join(', ');
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryCost;

  const orderData = {
    nombre_completo: nombre,
    grado: grado,
    grupo: grupo,
    salon: salon,
    telefono: telefono,
    dulces: dulcesTexto,
    total: total,
    fecha_pedido: new Date().toISOString(),
    estado: 'pendiente',
    metodo_pago: 'efectivo'
  };

  // Añadir información de split si está activo
  if (isSplitActive && splitCount > 1) {
    orderData.splitCount = splitCount;
    orderData.perPerson = total / splitCount;
  }

  // Deshabilitar botón mientras se procesa
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="loading-spinner"></div> Procesando...';

  try {
    // Guardar pedido en localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orderData.id = Date.now(); // ID único basado en timestamp
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Actualizar estadísticas del usuario si está logueado
    if (currentUser) {
      currentUser.totalSpent = (currentUser.totalSpent || 0) + total;
      currentUser.ordersCount = (currentUser.ordersCount || 0) + 1;

      // Guardar usuario actualizado
      if (currentUser.provider === 'google' || localStorage.getItem('user_logged_in') === 'true') {
        localStorage.setItem('user_data', JSON.stringify(currentUser));
      } else {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Actualizar en el array de usuarios
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
          users[userIndex] = currentUser;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }

      updateUserUI();
    }

    // Mostrar confirmación
    showConfirmation(orderData);
    resetForm();

    showToast('✅ ¡Pedido procesado exitosamente!', 'success');
  } catch (error) {
    showToast('❌ Error al procesar el pedido. Intenta nuevamente.', 'error');
    console.error('Error procesando pedido:', error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>🎉</span><span>Solicitar Entrega</span>';
  }
});

document.getElementById('close-modal-btn').addEventListener('click', resetForm);

// Clear cart button
document.getElementById('clear-cart-btn').addEventListener('click', clearCart);

// Cart toggle mobile
document.getElementById('cart-toggle-mobile').addEventListener('click', () => {
  const aside = document.querySelector('aside');
  aside.classList.toggle('mobile-cart-open');
});

// Close cart mobile button
document.getElementById('close-cart-mobile').addEventListener('click', () => {
  const aside = document.querySelector('aside');
  aside.classList.remove('mobile-cart-open');
});

// Search functionality
document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderCandies();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.category;
    renderCandies();
  });
});

// Split bill functionality
function toggleSplit() {
  isSplitActive = !isSplitActive;
  const splitSection = document.getElementById('split-section');
  const splitBtnText = document.getElementById('split-btn-text');

  if (isSplitActive) {
    splitSection.classList.remove('hidden');
    splitBtnText.textContent = 'Ocultar división';
    const items = Object.values(cart);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryCost;
    updateSplitAmount(total);
  } else {
    splitSection.classList.add('hidden');
    splitBtnText.textContent = 'Dividir cuenta';
    splitCount = 1;
    document.getElementById('split-count').textContent = splitCount;
  }
}

function changeSplitCount(delta) {
  splitCount = Math.max(1, Math.min(10, splitCount + delta));
  document.getElementById('split-count').textContent = splitCount;

  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryCost;
  updateSplitAmount(total);
}

function updateSplitAmount(total) {
  const perPerson = total / splitCount;
  document.getElementById('split-amount').textContent = `$${perPerson.toFixed(2)}`;
}

document.getElementById('toggle-split-btn').addEventListener('click', toggleSplit);

// Hacer funciones globales para onclick
window.changeSplitCount = changeSplitCount;
window.toggleSplit = toggleSplit;

// Element SDK Integration
async function onConfigChange(cfg) {
  document.getElementById('store-name').textContent = cfg.store_name || defaultConfig.store_name;
  document.getElementById('tagline').textContent = cfg.tagline || defaultConfig.tagline;
  document.getElementById('delivery-cost-display').textContent = `$${(cfg.delivery_cost || 2).toFixed(2)}`;
  deliveryCost = parseFloat(cfg.delivery_cost) || 2;
  updateCart();
}

function mapToCapabilities(cfg) {
  return {
    recolorables: [
      {
        get: () => cfg.primary_color || defaultConfig.primary_color,
        set: (value) => {
          config.primary_color = value;
          if (window.elementSdk) window.elementSdk.setConfig({ primary_color: value });
        }
      },
      {
        get: () => cfg.accent_color || defaultConfig.accent_color,
        set: (value) => {
          config.accent_color = value;
          if (window.elementSdk) window.elementSdk.setConfig({ accent_color: value });
        }
      }
    ],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

function mapToEditPanelValues(cfg) {
  return new Map([
    ['store_name', cfg.store_name || defaultConfig.store_name],
    ['tagline', cfg.tagline || defaultConfig.tagline],
    ['delivery_cost', String(cfg.delivery_cost || 2)],
    ['delivery_hours', cfg.delivery_hours || defaultConfig.delivery_hours]
  ]);
}

// Inicialización
async function init() {
  // Recargar productos desde localStorage por si fueron actualizados en admin
  candies = loadCandies();

  if (window.dataSdk) {
    const result = await window.dataSdk.init(dataHandler);
    if (!result.isOk) {
      console.error('Error inicializando Data SDK');
    }
  }

  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues
    });
    config = window.elementSdk.config || config;
  }

  onConfigChange(config);
  renderCandies();
  updateCart();
  initCarousel();
  initVoiceRecognition();
  initNutritionModal();
}

// ========== CARRUSEL DE OFERTAS ==========
function initCarousel() {
  const offers = [
    { title: '🎉 ¡Bienvenido!', description: 'Entrega gratis en tu primer pedido', color: 'from-purple-600 to-pink-600' },
    { title: '⚡ Oferta Flash', description: 'Chocolates 2x1 - Solo hoy', color: 'from-orange-600 to-red-600' },
    { title: '🍬 Combo del Día', description: 'Dulce + Bebida = $2.50', color: 'from-blue-600 to-cyan-600' },
    { title: '🎁 Sorpresa', description: 'Compra $5 y lleva un dulce gratis', color: 'from-green-600 to-emerald-600' }
  ];

  const container = document.getElementById('carousel-container');
  const indicators = document.getElementById('carousel-indicators');

  // Renderizar ofertas
  container.innerHTML = offers.map((offer, idx) => `
    <div class="min-w-full px-4 py-6 bg-gradient-to-r ${offer.color} rounded-xl text-center">
      <h3 class="text-2xl font-bold mb-2">${offer.title}</h3>
      <p class="text-white/90">${offer.description}</p>
    </div>
  `).join('');

  // Renderizar indicadores
  indicators.innerHTML = offers.map((_, idx) => `
    <button class="carousel-indicator ${idx === 0 ? 'active' : ''}" data-slide="${idx}"></button>
  `).join('');

  // Event listeners para navegación
  document.getElementById('carousel-prev').addEventListener('click', () => changeSlide(-1));
  document.getElementById('carousel-next').addEventListener('click', () => changeSlide(1));

  // Event listeners para indicadores
  document.querySelectorAll('.carousel-indicator').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSlide = parseInt(btn.dataset.slide);
      updateCarousel();
    });
  });

  // Auto-play
  startCarouselAutoPlay();
}

function changeSlide(direction) {
  const totalSlides = 4;
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateCarousel();
  resetCarouselAutoPlay();
}

function updateCarousel() {
  const container = document.getElementById('carousel-container');
  container.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Actualizar indicadores
  document.querySelectorAll('.carousel-indicator').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === currentSlide);
  });
}

function startCarouselAutoPlay() {
  carouselInterval = setInterval(() => {
    changeSlide(1);
  }, 5000); // Cambiar cada 5 segundos
}

function resetCarouselAutoPlay() {
  clearInterval(carouselInterval);
  startCarouselAutoPlay();
}

// ========== CONFETTI ==========
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const confettiCount = 150;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  // Crear confetti
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  let animationFrame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach((c, i) => {
      ctx.beginPath();
      ctx.lineWidth = c.r / 2;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
      ctx.stroke();

      // Actualizar posición
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
      c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;

      // Remover si sale de la pantalla
      if (c.y > canvas.height) {
        confetti.splice(i, 1);
      }
    });

    if (confetti.length > 0) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animationFrame);
    }
  }

  draw();
}

// ========== RECONOCIMIENTO DE VOZ ==========
function initVoiceRecognition() {
  const voiceBtn = document.getElementById('voice-btn');
  const voiceIcon = document.getElementById('voice-icon');

  // Verificar soporte del navegador
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    voiceBtn.style.display = 'none';
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener('click', toggleVoiceRecognition);

  recognition.onstart = () => {
    isListening = true;
    voiceIcon.textContent = '🔴';
    voiceBtn.classList.add('animate-pulse');
    showToast('🎤 Escuchando... Di "añadir" + nombre del producto', 'info');
  };

  recognition.onend = () => {
    isListening = false;
    voiceIcon.textContent = '🎤';
    voiceBtn.classList.remove('animate-pulse');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    processVoiceCommand(transcript);
  };

  recognition.onerror = (event) => {
    showToast('❌ Error en reconocimiento de voz', 'error');
    isListening = false;
    voiceIcon.textContent = '🎤';
    voiceBtn.classList.remove('animate-pulse');
  };
}

function toggleVoiceRecognition() {
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

function processVoiceCommand(transcript) {
  console.log('Comando de voz:', transcript);

  // Buscar productos que coincidan
  const foundProducts = candies.filter(candy =>
    transcript.includes(candy.name.toLowerCase()) ||
    candy.name.toLowerCase().includes(transcript.replace('añadir ', '').replace('agregar ', ''))
  );

  if (foundProducts.length > 0) {
    const product = foundProducts[0];
    addToCart(product);
    showToast(`✅ ${product.name} añadido por voz`, 'success');
  } else {
    showToast('❌ No se encontró el producto. Intenta de nuevo.', 'error');
  }
}

// ========== CALCULADORA NUTRICIONAL ==========
function initNutritionModal() {
  const nutritionBtn = document.getElementById('nutrition-btn');
  const nutritionModal = document.getElementById('nutrition-modal');
  const closeNutritionBtn = document.getElementById('close-nutrition-btn');

  nutritionBtn.addEventListener('click', showNutritionInfo);
  closeNutritionBtn.addEventListener('click', () => {
    nutritionModal.classList.remove('active');
  });

  nutritionModal.addEventListener('click', (e) => {
    if (e.target === nutritionModal) {
      nutritionModal.classList.remove('active');
    }
  });
}

function showNutritionInfo() {
  const nutritionModal = document.getElementById('nutrition-modal');
  const nutritionContent = document.getElementById('nutrition-content');

  const cartItems = Object.values(cart);

  if (cartItems.length === 0) {
    showToast('❌ Tu carrito está vacío', 'error');
    return;
  }

  // Calcular totales nutricionales
  let totalCalories = 0;
  let totalSugar = 0;
  let totalFat = 0;
  let totalProtein = 0;

  const itemsHTML = cartItems.map(item => {
    const nutrition = item.nutrition || { calories: 0, sugar: 0, fat: 0, protein: 0 };
    const itemCalories = nutrition.calories * item.quantity;
    const itemSugar = nutrition.sugar * item.quantity;
    const itemFat = nutrition.fat * item.quantity;
    const itemProtein = nutrition.protein * item.quantity;

    totalCalories += itemCalories;
    totalSugar += itemSugar;
    totalFat += itemFat;
    totalProtein += itemProtein;

    return `
      <div class="bg-white/5 rounded-lg p-4 border border-white/10">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">${item.emoji}</span>
          <div class="flex-1">
            <h4 class="font-bold">${item.name}</h4>
            <p class="text-sm text-gray-400">Cantidad: ${item.quantity}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="bg-red-500/10 rounded p-2">
            <p class="text-gray-400 text-xs">Calorías</p>
            <p class="font-bold text-red-400">${itemCalories} kcal</p>
          </div>
          <div class="bg-yellow-500/10 rounded p-2">
            <p class="text-gray-400 text-xs">Azúcar</p>
            <p class="font-bold text-yellow-400">${itemSugar.toFixed(1)}g</p>
          </div>
          <div class="bg-orange-500/10 rounded p-2">
            <p class="text-gray-400 text-xs">Grasa</p>
            <p class="font-bold text-orange-400">${itemFat.toFixed(1)}g</p>
          </div>
          <div class="bg-blue-500/10 rounded p-2">
            <p class="text-gray-400 text-xs">Proteína</p>
            <p class="font-bold text-blue-400">${itemProtein.toFixed(1)}g</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const totalsHTML = `
    <div class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-500/30">
      <h4 class="font-bold text-xl mb-4 text-center">📊 Totales Nutricionales</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-black/30 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm mb-1">🔥 Calorías</p>
          <p class="text-2xl font-bold text-red-400">${totalCalories}</p>
          <p class="text-xs text-gray-500">kcal</p>
        </div>
        <div class="bg-black/30 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm mb-1">🍬 Azúcar</p>
          <p class="text-2xl font-bold text-yellow-400">${totalSugar.toFixed(1)}</p>
          <p class="text-xs text-gray-500">gramos</p>
        </div>
        <div class="bg-black/30 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm mb-1">🧈 Grasa</p>
          <p class="text-2xl font-bold text-orange-400">${totalFat.toFixed(1)}</p>
          <p class="text-xs text-gray-500">gramos</p>
        </div>
        <div class="bg-black/30 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm mb-1">💪 Proteína</p>
          <p class="text-2xl font-bold text-blue-400">${totalProtein.toFixed(1)}</p>
          <p class="text-xs text-gray-500">gramos</p>
        </div>
      </div>
    </div>
  `;

  nutritionContent.innerHTML = itemsHTML + totalsHTML;
  nutritionModal.classList.add('active');
}

// ========== SPLASH SCREEN ==========
function initSplashScreen() {
  const splashScreen = document.getElementById('splash-screen');

  setTimeout(() => {
    splashScreen.style.opacity = '0';
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 500);
  }, 2000);
}

// ========== MENÚ HAMBURGUESA ==========
const hamburgerBtn = document.getElementById('hamburger-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const hamburgerOverlay = document.getElementById('hamburger-overlay');
const closeHamburgerBtn = document.getElementById('close-hamburger-btn');

function openHamburgerMenu() {
  hamburgerMenu.classList.add('open');
  hamburgerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeHamburgerMenu() {
  hamburgerMenu.classList.remove('open');
  hamburgerOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

hamburgerBtn.addEventListener('click', openHamburgerMenu);
closeHamburgerBtn.addEventListener('click', closeHamburgerMenu);
hamburgerOverlay.addEventListener('click', closeHamburgerMenu);

// ========== INICIO DE SESIÓN SOCIAL ==========
// Botones de Apple y Google en formulario de login
document.querySelectorAll('#login-form .social-login-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const provider = btn.classList.contains('apple') ? 'Apple' : 'Google';
    showToast(`Inicio de sesión con ${provider} próximamente disponible 🚀`, 'info');
  });
});

// Botones de Apple y Google en formulario de registro
document.querySelectorAll('#register-form .social-login-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const provider = btn.classList.contains('apple') ? 'Apple' : 'Google';
    showToast(`Registro con ${provider} próximamente disponible 🚀`, 'info');
  });
});

// ========== SISTEMA DE USUARIOS ==========
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let users = JSON.parse(localStorage.getItem('users') || '[]');

// Verificar si hay usuario de Google al cargar
function loadCurrentUser() {
  // Primero verificar si hay datos de Google
  const userData = localStorage.getItem('user_data');
  const userLoggedIn = localStorage.getItem('user_logged_in');

  if (userData && userLoggedIn === 'true') {
    try {
      currentUser = JSON.parse(userData);
      return currentUser;
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  // Si no, usar el sistema tradicional
  currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  return currentUser;
}

// Cargar usuario al inicio
currentUser = loadCurrentUser();

function updateUserUI() {
  // Recargar usuario por si cambió
  currentUser = loadCurrentUser();

  const userProfileSection = document.getElementById('user-profile-section');
  const menuLoginBtn = document.getElementById('menu-login-btn');
  const menuLogoutBtn = document.getElementById('menu-logout-btn');

  if (currentUser) {
    // Usuario logueado
    userProfileSection.classList.remove('hidden');
    menuLoginBtn.classList.add('hidden');
    menuLogoutBtn.classList.remove('hidden');

    // Actualizar información del usuario
    const userAvatarEl = document.getElementById('user-avatar');
    const profileAvatarEl = document.getElementById('profile-avatar');

    // Si el usuario tiene foto de Google, mostrarla
    if (currentUser.picture && currentUser.provider === 'google') {
      // Crear imagen para el avatar del menú
      userAvatarEl.innerHTML = `<img src="${currentUser.picture}" alt="${currentUser.name}" class="w-full h-full rounded-full object-cover">`;

      // Crear imagen para el perfil completo
      if (profileAvatarEl) {
        profileAvatarEl.innerHTML = `<img src="${currentUser.picture}" alt="${currentUser.name}" class="w-full h-full rounded-full object-cover">`;
      }
    } else {
      // Mostrar iniciales si no hay foto
      const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
      userAvatarEl.textContent = initials;
      if (profileAvatarEl) {
        profileAvatarEl.textContent = initials;
      }
    }

    document.getElementById('user-name-display').textContent = currentUser.name;
    document.getElementById('user-email-display').textContent = currentUser.email;

    // Actualizar perfil completo si existe
    const profileNameEl = document.getElementById('profile-name');
    const profileEmailEl = document.getElementById('profile-email');
    const profileTotalSpentEl = document.getElementById('profile-total-spent');
    const profileOrdersCountEl = document.getElementById('profile-orders-count');

    if (profileNameEl) profileNameEl.textContent = currentUser.name;
    if (profileEmailEl) profileEmailEl.textContent = currentUser.email;
    if (profileTotalSpentEl) profileTotalSpentEl.textContent = `$${(currentUser.totalSpent || 0).toFixed(2)}`;
    if (profileOrdersCountEl) profileOrdersCountEl.textContent = currentUser.ordersCount || 0;
  } else {
    // Usuario NO logueado
    userProfileSection.classList.add('hidden');
    menuLoginBtn.classList.remove('hidden');
    menuLogoutBtn.classList.add('hidden');
  }
}

// ========== MODAL DE LOGIN/REGISTRO ==========
const userAuthModal = document.getElementById('user-auth-modal');
const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const menuLoginBtn = document.getElementById('menu-login-btn');

function showAuthModal() {
  userAuthModal.classList.add('active');
  closeHamburgerMenu();
}

function closeAuthModal() {
  userAuthModal.classList.remove('active');
}

menuLoginBtn.addEventListener('click', showAuthModal);
closeAuthModalBtn.addEventListener('click', closeAuthModal);

loginTab.addEventListener('click', () => {
  loginTab.classList.add('bg-blue-500', 'text-white');
  loginTab.classList.remove('bg-white/5', 'text-gray-400');
  registerTab.classList.remove('bg-blue-500', 'text-white');
  registerTab.classList.add('bg-white/5', 'text-gray-400');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  document.getElementById('auth-modal-title').textContent = 'Iniciar Sesión';
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('bg-blue-500', 'text-white');
  registerTab.classList.remove('bg-white/5', 'text-gray-400');
  loginTab.classList.remove('bg-blue-500', 'text-white');
  loginTab.classList.add('bg-white/5', 'text-gray-400');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  document.getElementById('auth-modal-title').textContent = 'Registrarse';
});

// Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserUI();
    closeAuthModal();
    showToast('¡Bienvenido de vuelta! 👋', 'success');
    loginForm.reset();
  } else {
    showToast('Email o contraseña incorrectos', 'error');
  }
});

// Registro
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  // Verificar si el email ya existe
  if (users.find(u => u.email === email)) {
    showToast('Este email ya está registrado', 'error');
    return;
  }

  // Crear nuevo usuario
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    totalSpent: 0,
    ordersCount: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  updateUserUI();
  closeAuthModal();
  showToast('¡Cuenta creada exitosamente! 🎉', 'success');
  registerForm.reset();
});

// ========== MODAL DE PERFIL ==========
const userProfileModal = document.getElementById('user-profile-modal');
const viewProfileBtn = document.getElementById('view-profile-btn');
const closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
const closeProfileBtn = document.getElementById('close-profile-btn');

viewProfileBtn.addEventListener('click', () => {
  userProfileModal.classList.add('active');
  closeHamburgerMenu();
});

closeProfileModalBtn.addEventListener('click', () => {
  userProfileModal.classList.remove('active');
});

closeProfileBtn.addEventListener('click', () => {
  userProfileModal.classList.remove('active');
});

// Cerrar sesión
document.getElementById('menu-logout-btn').addEventListener('click', () => {
  currentUser = null;
  // Limpiar todos los datos de sesión (Google y manual)
  localStorage.removeItem('currentUser');
  localStorage.removeItem('user_data');
  localStorage.removeItem('user_logged_in');
  localStorage.removeItem('mercadeo_auth_token');
  updateUserUI();
  closeHamburgerMenu();
  showToast('Sesión cerrada correctamente', 'info');
});

// Admin desde menú
document.getElementById('menu-admin-btn').addEventListener('click', () => {
  closeHamburgerMenu();
  showLoginModal();
});

// ========== IA DE MERCADEO ==========
// ========== IA DE MERCADEO ==========
function toggleAIChat() {
  const panel = document.getElementById('ai-chat-panel');
  const overlay = document.getElementById('ai-chat-overlay');

  if (!panel || !overlay) {
    console.error('Elementos del chat no encontrados');
    return;
  }

  const isClosed = panel.classList.contains('translate-x-full');

  if (isClosed) {
    // Abrir Panel
    panel.classList.remove('translate-x-full');
    overlay.classList.remove('pointer-events-none');
    setTimeout(() => overlay.classList.remove('opacity-0'), 10); // Fade in suave
    document.body.style.overflow = 'hidden'; // Bloquear scroll del body

    // Focar input si es posible
    setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
  } else {
    // Cerrar Panel
    panel.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    setTimeout(() => {
      overlay.classList.add('pointer-events-none');
      document.body.style.overflow = 'auto'; // Restaurar scroll
    }, 300);
  }
}

// Función para resetear el chat
function resetAIChat() {
  // Limpiar historial
  conversationHistory = [];

  // Limpiar mensajes (mantener solo el mensaje de bienvenida)
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = `
      <div class="flex gap-3 animate-fade-in">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          IA
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%]">
          <p class="text-sm text-gray-700">
            ¡Hola! Soy la <strong>IA de Mercadeo PCB</strong> 🤖📊<br><br>
            Soy el asistente oficial del taller de Mercadeo de la Escuela Superior Vocacional Pablo Colón Berdecia.<br><br>
            <strong>Puedo ayudarte con:</strong><br>
            📚 Conceptos de mercadeo y ventas<br>
            🧮 Cálculos de porcentajes y descuentos<br>
            🍬 Productos de nuestra tienda<br>
            📅 Calendario escolar y fechas importantes<br>
            💼 Servicio al cliente y estrategias comerciales<br><br>
            ¿En qué puedo ayudarte hoy?
          </p>
        </div>
      </div>
    `;
  }

  showToast('💬 Nueva conversación iniciada', 'info');
}

// ========== CHATBOT CON CHATGPT ==========
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const chatSubmitBtn = document.getElementById('chat-submit-btn');

// Historial de conversación
let conversationHistory = [];

if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Deshabilitar input mientras procesa
    chatInput.disabled = true;
    if (chatSubmitBtn) chatSubmitBtn.disabled = true;

    // 1. Mostrar mensaje del usuario
    addMessage(text, 'user');
    chatInput.value = '';

    // 2. Simular "Escribiendo..."
    showTyping();

    try {
      // 3. Intentar usar ChatGPT API
      const response = await sendToChatGPT(text);
      removeTyping();
      addMessage(response, 'ai');
    } catch (error) {
      console.error('Error con ChatGPT:', error);
      removeTyping();

      // Fallback: usar IA local
      const fallbackResponse = processAIResponse(text);
      addMessage(fallbackResponse, 'ai');
    } finally {
      // Rehabilitar input
      chatInput.disabled = false;
      if (chatSubmitBtn) chatSubmitBtn.disabled = false;
      chatInput.focus();
    }
  });
}

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `flex gap-3 ${sender === 'user' ? 'flex-row-reverse' : ''}`;

  const avatar = sender === 'ai'
    ? `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">IA</div>`
    : `<div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">Tú</div>`;

  const bubbleClass = sender === 'ai'
    ? 'bg-white border border-gray-200 text-gray-700'
    : 'bg-purple-600 text-white';

  div.innerHTML = `
    ${avatar}
    <div class="${bubbleClass} rounded-2xl ${sender === 'ai' ? 'rounded-tl-none' : 'rounded-tr-none'} p-3 shadow-sm max-w-[85%] animate-slide-up">
      <p class="text-sm leading-relaxed">${text}</p>
    </div>
  `;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'flex gap-3';
  div.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">IA</div>
    <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1">
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
    </div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ========== CONEXIÓN CON CHATGPT API ==========
async function sendToChatGPT(userMessage) {
  // Verificar si AI_CONFIG está definido y configurado
  if (typeof AI_CONFIG === 'undefined' || !AI_CONFIG.apiKey || AI_CONFIG.apiKey === 'TU_API_KEY_AQUI') {
    throw new Error('API Key no configurada');
  }

  // Añadir mensaje al historial
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });

  // Preparar el system prompt con las instrucciones del GPT personalizado
  const systemPrompt = `Eres IA de Mercadeo PCB, el asistente oficial del curso y taller de Mercadeo de la Escuela Superior Vocacional Pablo Colón Berdecia.

═══════════════════════════════════════════════════════
📋 INFORMACIÓN DEL PROGRAMA
═══════════════════════════════════════════════════════

PROGRAMA: Administración de Empresas
ESPECIALIDAD: Representante de Ventas y Servicios Empresariales

MISIÓN:
Formar estudiantes con las competencias necesarias para desempeñarse con excelencia en ventas, servicio al cliente y áreas relacionadas al mercadeo, fomentando liderazgo, iniciativa, ética profesional y responsabilidad.

VISIÓN:
Ser un programa líder en la preparación de estudiantes técnicos altamente competentes, capaces de integrarse al mercado laboral o continuar estudios en áreas empresariales con una base sólida en mercadeo, ventas y servicio.

VALORES:
Fortalecer el espíritu de servicio y la conciencia cívica del estudiante para que sea más sensible y solidario con los demás.

═══════════════════════════════════════════════════════
👩‍🏫 INFORMACIÓN DE LA MAESTRA
═══════════════════════════════════════════════════════

Nombre: Ada J. Rivera Alejandro
Años de experiencia: 20 años
Correo electrónico: de155982@miescuela.pr (solo para fines informativos)

═══════════════════════════════════════════════════════
📚 ÁREAS DE ADIESTRAMIENTO
═══════════════════════════════════════════════════════

• Ventas y Servicio al Cliente
• Compras
• Finanzas
• Publicidad
• Relaciones Públicas
• Empaque
• Operaciones de Negocios
• Promoción de Ventas
• Envoltura Artística
• Manejo de Caja Registradora
• Mercadeo Digital

═══════════════════════════════════════════════════════
💼 OPORTUNIDADES DE EMPLEO
═══════════════════════════════════════════════════════

Los estudiantes que completan esta especialidad pueden desempeñarse en:

• Representante de ventas
• Asociado de servicio al cliente
• Cajero/a
• Promotor o merchandiser
• Auxiliar de oficina o asistente de mercadeo
• Empleos en tiendas por departamento, supermercados y empresas de servicios
• Posiciones iniciales en publicidad, inventario y ventas digitales

═══════════════════════════════════════════════════════
✨ ¿POR QUÉ ELEGIR MERCADEO?
═══════════════════════════════════════════════════════

• Es un taller dinámico, práctico y centrado en experiencias reales
• Desarrolla destrezas esenciales que buscan todos los patrones
• Fortalece la comunicación, seguridad personal y liderazgo
• Prepara para competencias y certificaciones a través de DECA
• Permite participar activamente en la Cooperativa Juvenil
• Amplía las oportunidades de empleo y estudios universitarios
• Forma estudiantes creativos, proactivos y preparados para el mundo laboral

═══════════════════════════════════════════════════════
📝 REQUISITOS DE ADMISIÓN
═══════════════════════════════════════════════════════

• Promedio general mínimo de 2.00
• Buena conducta y disposición para el trabajo en equipo
• Interés en ventas, servicio al cliente o negocios
• Ingresar al programa desde noveno grado

TUS FUNCIONES:
1. Apoyas a estudiantes explicando mercadeo, ventas, servicio al cliente y matemáticas aplicadas de forma clara y paso a paso, como un tutor paciente
2. Eres experto en:
   - Marketing y estrategias de mercadeo
   - Cálculo de porcentajes, descuentos, márgenes de ganancia
   - Técnicas de ventas y negociación
   - Servicio al cliente y atención
   - Matemáticas comerciales aplicadas
   - Análisis de mercado y competencia
   - Estrategias de promoción y publicidad
3. Ayudas con la tienda de dulces del taller, recomendando productos y calculando precios
4. Respondes preguntas sobre el calendario escolar y fechas importantes

CALENDARIO ESCOLAR (FEBRERO - MAYO 2025):

📅 FEBRERO
• 13 de febrero: Reuniones profesionales de facultad (tarde)
• 16 de febrero: Día festivo
• 19 de febrero: Assessment

📅 MARZO
• 2 de marzo: Día festivo
• 16 de marzo: Assessment
• 20 de marzo: Reuniones profesionales de facultad (tarde)
• 23 de marzo: Día festivo
• 27 de marzo: Entrega del informe de progreso académico

📅 ABRIL
• 2 de abril: Receso académico
• 3 de abril: Feriado
• 13 de abril al 7 de mayo: Assessment

📅 MAYO
• 13 de abril al 7 de mayo: Assessment (continúa)
• 18 al 22 de mayo: Semana de la Educación
• 22 de mayo: Receso académico
• 25 de mayo: Feriado
• 26 y 27 de mayo: Evaluaciones finales
• 29 de mayo: Entrega del informe de progreso académico

INFORMACIÓN DEL TALLER:
Para información general del taller y Casa Abierta: https://hackerpcb1.github.io/Casa-Abierta/mercadeo.html

PRODUCTOS DISPONIBLES EN LA TIENDA:
${JSON.stringify(candies, null, 2)}

TU ESTILO:
- Tono respetuoso, educativo y motivador
- Explicas paso a paso, como un tutor paciente
- Usas emojis de forma natural 🍬📊💼
- Hablas en español de Puerto Rico
- Guías sin hacer trabajos por el estudiante
- Fomentas el pensamiento crítico y el aprendizaje

IMPORTANTE: Cuando te pregunten sobre cálculos (porcentajes, descuentos, ganancias), explica el proceso paso a paso para que el estudiante aprenda.`;


  // Preparar el payload
  const payload = {
    model: AI_CONFIG.model || 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory
    ],
    max_tokens: AI_CONFIG.maxTokens || 500,
    temperature: AI_CONFIG.temperature || 0.7
  };

  // Hacer la petición a la API
  const response = await fetch(AI_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Añadir respuesta al historial
  conversationHistory.push({
    role: 'assistant',
    content: aiResponse
  });

  // Limitar historial a últimos 20 mensajes (10 intercambios)
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  return aiResponse;
}

// ========== IA LOCAL (FALLBACK) ==========
function processAIResponse(input) {
  input = input.toLowerCase();

  // Saludos
  if (input.match(/hola|buenos|buenas|hey/)) {
    return "¡Hola! 👋 Soy tu asistente de Mercadeo. ¿Buscas algo dulce, salado o una bebida?";
  }

  // Comandos de productos
  const foundCandies = candies.filter(c => input.includes(c.name.toLowerCase()) || input.includes(c.category));

  if (foundCandies.length > 0) {
    const list = foundCandies.slice(0, 3).map(c => `• ${c.emoji} **${c.name}** ($${c.price.toFixed(2)})`).join('<br>');
    return `¡Claro! Aquí tienes algunas opciones que te pueden gustar:<br><br>${list}<br><br>¿Quieres que añada alguno al carrito?`;
  }

  // Precios
  if (input.includes('precio') || input.includes('cuesta') || input.includes('vale')) {
    return "Los precios varían entre $0.25 y $1.50. ¿Tienes un presupuesto en mente?";
  }

  // Ayuda general
  if (input.includes('ayuda') || input.includes('que haces')) {
    return "Puedo ayudarte a:<br>1. Buscar dulces 🍬<br>2. Ver precios 💰<br>3. Sugerirte combinaciones 🥤";
  }

  // Default
  return "Mmm, interesante. 🤔 No estoy segura de entender eso, pero puedo mostrarte nuestros dulces más populares si escribes 'popular'.";
}
// ========== SISTEMA DE NOTIFICACIONES ==========
let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
let notificationPermission = localStorage.getItem('notificationPermission') || 'default';

// Solicitar permiso para notificaciones del navegador
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      notificationPermission = permission;
      localStorage.setItem('notificationPermission', permission);
      if (permission === 'granted') {
        showToast('✅ Notificaciones activadas', 'success');
        addNotification('🎉 ¡Bienvenido!', 'Las notificaciones están activadas. Te avisaremos de ofertas y novedades.', 'info');
      }
    });
  }
}

// Añadir notificación
function addNotification(title, message, type = 'info', icon = '🔔') {
  const notification = {
    id: Date.now(),
    title,
    message,
    type,
    icon,
    time: new Date().toISOString(),
    read: false
  };

  notifications.unshift(notification);

  // Limitar a 50 notificaciones
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }

  localStorage.setItem('notifications', JSON.stringify(notifications));
  updateNotificationUI();

  // Mostrar notificación del navegador si está permitido
  if (notificationPermission === 'granted' && 'Notification' in window) {
    new Notification(title, {
      body: message,
      icon: 'galeria/image1.png',
      badge: 'galeria/image1.png',
      tag: notification.id.toString()
    });
  }
}

// Actualizar UI de notificaciones
function updateNotificationUI() {
  const unreadCount = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notification-count');
  const list = document.getElementById('notification-list');
  const banner = document.getElementById('enable-notifications-banner');

  // Mostrar/ocultar banner de activación
  if ('Notification' in window && Notification.permission === 'default') {
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }

  // Actualizar badge
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  // Actualizar lista
  if (notifications.length === 0) {
    list.innerHTML = `
      <div class="notification-empty">
        <div class="text-4xl mb-2">🔔</div>
        <p>No tienes notificaciones</p>
      </div>
    `;
  } else {
    list.innerHTML = notifications.map(n => `
      <div class="notification-item ${!n.read ? 'unread' : ''}" data-id="${n.id}">
        <div class="flex items-start gap-3">
          <div class="notification-icon bg-${getNotificationColor(n.type)}/20">
            ${n.icon}
          </div>
          <div class="notification-content flex-1">
            <div class="notification-title">${n.title}</div>
            <div class="notification-message">${n.message}</div>
            <div class="notification-time">${getTimeAgo(n.time)}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Añadir event listeners
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        markAsRead(id);
      });
    });
  }
}

function getNotificationColor(type) {
  const colors = {
    'info': 'blue',
    'success': 'green',
    'warning': 'yellow',
    'error': 'red',
    'offer': 'purple'
  };
  return colors[type] || 'blue';
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000); // segundos

  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
  return time.toLocaleDateString();
}

function markAsRead(id) {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationUI();
  }
}

function clearAllNotifications() {
  notifications = [];
  localStorage.setItem('notifications', JSON.stringify(notifications));
  updateNotificationUI();
  showToast('Notificaciones eliminadas', 'info');
}

// Toggle panel de notificaciones
const notificationBell = document.getElementById('notification-bell');
const notificationPanel = document.getElementById('notification-panel');

notificationBell.addEventListener('click', (e) => {
  e.stopPropagation();
  notificationPanel.classList.toggle('active');
});

// Cerrar panel al hacer click fuera
document.addEventListener('click', (e) => {
  if (!notificationPanel.contains(e.target) && !notificationBell.contains(e.target)) {
    notificationPanel.classList.remove('active');
  }
});

// Limpiar notificaciones
document.getElementById('clear-notifications').addEventListener('click', clearAllNotifications);

// Botón para activar notificaciones manualmente
document.getElementById('enable-notifications-btn').addEventListener('click', () => {
  requestNotificationPermission();
});

// Solicitar permiso al cargar (después de 3 segundos)
setTimeout(() => {
  if (notificationPermission === 'default') {
    requestNotificationPermission();
  }
}, 3000);

// Inicializar
initSplashScreen();
updateUserUI();
updateNotificationUI();
init();
