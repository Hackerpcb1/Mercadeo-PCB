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
      <h4 class="font-semibold text-white mb-1">${candy.name}</h4>
      <p class="text-xs text-gray-400 mb-2 capitalize">${getCategoryName(candy.category)}</p>
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
    const result = await window.dataSdk.create(orderData);
    
    if (result.isOk) {
      showConfirmation(orderData);
      resetForm();
    } else {
      showToast('Error al procesar el pedido. Intenta nuevamente.');
    }
  } catch (error) {
    showToast('Error al procesar el pedido.');
    console.error(error);
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

init();
