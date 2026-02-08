// Simple JWT-like authentication system (client-side)
// En producción, esto debería ser server-side con JWT real

const AUTH_CONFIG = {
  username: 'Admin',
  password: 'Mercadeo2026',
  tokenKey: 'mercadeo_auth_token',
  tokenExpiry: 24 * 60 * 60 * 1000 // 24 horas
};

// Simular estructura JWT
function createToken(username) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: username,
    iat: Date.now(),
    exp: Date.now() + AUTH_CONFIG.tokenExpiry,
    role: 'admin'
  };
  
  // En producción, esto sería firmado con una clave secreta
  const token = {
    header: btoa(JSON.stringify(header)),
    payload: btoa(JSON.stringify(payload)),
    signature: btoa(username + AUTH_CONFIG.password + Date.now())
  };
  
  return `${token.header}.${token.payload}.${token.signature}`;
}

function verifyToken(token) {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar expiración
    if (payload.exp < Date.now()) {
      logout();
      return false;
    }
    
    return payload;
  } catch (error) {
    return false;
  }
}

function login(username, password) {
  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
    const token = createToken(username);
    localStorage.setItem(AUTH_CONFIG.tokenKey, token);
    return { success: true, token };
  }
  return { success: false, message: 'Usuario o contraseña incorrectos' };
}

function logout() {
  localStorage.removeItem(AUTH_CONFIG.tokenKey);
  window.location.reload();
}

function isAuthenticated() {
  const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
  return verifyToken(token) !== false;
}

function getCurrentUser() {
  const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
  return verifyToken(token);
}

// Mostrar modal de login
function showLoginModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'login-modal';
  modal.innerHTML = `
    <div class="glass-card rounded-2xl p-8 max-w-md w-full border border-white/10 animate-slide-up">
      <div class="text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-3xl">
          🔐
        </div>
        <h3 class="font-display text-2xl font-bold mb-2">Panel de Administración</h3>
        <p class="text-gray-400">Ingresa tus credenciales</p>
      </div>
      
      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">Usuario</label>
          <input type="text" id="login-username" 
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#3b82f6] focus:outline-none transition-colors"
            placeholder="Admin" required>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">Contraseña</label>
          <input type="password" id="login-password" 
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#3b82f6] focus:outline-none transition-colors"
            placeholder="••••••••" required>
        </div>
        
        <div id="login-error" class="hidden text-red-400 text-sm text-center p-2 bg-red-400/10 rounded-lg">
        </div>
        
        <button type="submit" class="btn-primary w-full text-white font-bold py-3 rounded-lg">
          🔓 Iniciar Sesión
        </button>
        
        <button type="button" onclick="document.getElementById('login-modal').remove()" 
          class="w-full text-gray-400 hover:text-white transition-colors py-2">
          Cancelar
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const result = login(username, password);
    
    if (result.success) {
      modal.remove();
      showToast('✅ Sesión iniciada correctamente', 'success');
      setTimeout(() => window.location.href = 'admin.html', 500);
    } else {
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = result.message;
      errorDiv.classList.remove('hidden');
    }
  });
}

