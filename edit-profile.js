// ========== CARGAR DATOS DEL USUARIO ==========
function loadCurrentUser() {
  // Primero verificar si hay datos de Google
  const userData = localStorage.getItem('user_data');
  const userLoggedIn = localStorage.getItem('user_logged_in');
  
  if (userData && userLoggedIn === 'true') {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  // Si no, usar el sistema tradicional
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

let currentUser = loadCurrentUser();

// Verificar si el usuario está logueado
if (!currentUser) {
  // Si no está logueado, redirigir a login
  window.location.href = 'login.html';
}

// ========== CARGAR DATOS EN EL FORMULARIO ==========
function loadUserData() {
  if (!currentUser) return;

  // Avatar
  const avatarEl = document.getElementById('edit-avatar');
  if (currentUser.picture && currentUser.provider === 'google') {
    avatarEl.innerHTML = `<img src="${currentUser.picture}" alt="${currentUser.name}" class="w-full h-full rounded-full object-cover">`;
  } else {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    avatarEl.textContent = initials;
  }

  // Datos básicos
  document.getElementById('edit-name').value = currentUser.name || '';
  document.getElementById('edit-email').value = currentUser.email || '';
  
  // Si es usuario de Google, deshabilitar el campo de email
  if (currentUser.provider === 'google') {
    document.getElementById('edit-email').disabled = true;
    document.getElementById('edit-email').classList.add('opacity-50', 'cursor-not-allowed');
  }

  // Datos adicionales
  document.getElementById('edit-phone').value = currentUser.phone || '';
  document.getElementById('edit-group').value = currentUser.group || '';
  document.getElementById('edit-room').value = currentUser.room || '';
  document.getElementById('edit-delivery-notes').value = currentUser.deliveryNotes || '';
}

// Cargar datos al iniciar
loadUserData();

// ========== GUARDAR CAMBIOS ==========
document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Obtener valores del formulario
  const updatedData = {
    ...currentUser,
    name: document.getElementById('edit-name').value,
    phone: document.getElementById('edit-phone').value,
    group: document.getElementById('edit-group').value,
    room: document.getElementById('edit-room').value,
    deliveryNotes: document.getElementById('edit-delivery-notes').value
  };

  // Si no es usuario de Google, permitir cambiar email
  if (currentUser.provider !== 'google') {
    updatedData.email = document.getElementById('edit-email').value;
  }

  // Guardar en localStorage
  if (currentUser.provider === 'google' || localStorage.getItem('user_logged_in') === 'true') {
    // Usuario de Google
    localStorage.setItem('user_data', JSON.stringify(updatedData));
  } else {
    // Usuario tradicional
    localStorage.setItem('currentUser', JSON.stringify(updatedData));
    
    // También actualizar en el array de usuarios si existe
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedData;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // Actualizar variable local
  currentUser = updatedData;

  // Mostrar mensaje de éxito
  showMessage('✅ Perfil actualizado correctamente', 'success');

  // Redirigir después de 1.5 segundos
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
});

// ========== FUNCIONES DE UI ==========
function showMessage(message, type) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.textContent = message;
  statusDiv.classList.remove('hidden');
  
  // Estilos según el tipo
  if (type === 'success') {
    statusDiv.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-green-500/20 border border-green-500/50 text-green-200';
  } else if (type === 'error') {
    statusDiv.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-red-500/20 border border-red-500/50 text-red-200';
  } else {
    statusDiv.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-blue-500/20 border border-blue-500/50 text-blue-200';
  }
}

// ========== VALIDACIÓN DE TELÉFONO ==========
document.getElementById('edit-phone').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, ''); // Solo números
  
  // Formatear como (787) 123-4567
  if (value.length > 0) {
    if (value.length <= 3) {
      value = `(${value}`;
    } else if (value.length <= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
  }
  
  e.target.value = value;
});

