# 🎉 Nuevas Funcionalidades - Mercadeo PCB

## 🔐 Sistema de Autenticación JWT

### Credenciales de Administrador
- **Usuario:** `Admin`
- **Contraseña:** `Mercadeo2026`

### Estructura JWT
El sistema utiliza una estructura JWT (JSON Web Token) con:
- **Header:** Algoritmo HS256
- **Payload:** Usuario, fecha de emisión, expiración (24 horas), rol
- **Signature:** Firma de seguridad

### Acceso al Panel
1. Haz clic en el botón "🔐 Admin" en el header
2. Ingresa las credenciales
3. Serás redirigido al panel de administración

---

## 🎛️ Panel de Administración

### Funcionalidades
- ✅ **Ver todos los productos** en tabla organizada
- ➕ **Añadir nuevos productos** con emoji, nombre, precio, categoría
- ✏️ **Editar productos existentes**
- 🗑️ **Eliminar productos**
- ⭐ **Marcar productos como populares**
- 📊 **Estadísticas en tiempo real** (total productos, precio promedio)

### Categorías Disponibles
- 🍬 Dulces
- 🍫 Chocolates
- 🥤 Bebidas
- 🍿 Snacks

### Acceso
- URL: `admin.html`
- Requiere autenticación
- Los cambios se guardan en localStorage
- Los productos se sincronizan automáticamente con la tienda

---

## 👥 Dividir Cuenta

### Cómo Usar
1. Añade productos al carrito
2. Haz clic en "👥 Dividir cuenta" debajo del total
3. Usa los botones **+** y **-** para ajustar el número de personas (1-10)
4. El sistema calcula automáticamente cuánto paga cada persona

### Características
- División equitativa del total (productos + entrega)
- Actualización en tiempo real
- Se muestra en el resumen del pedido
- Información incluida en la confirmación

---

## 💵 Método de Pago

### Efectivo Únicamente
- El único método de pago aceptado es **efectivo**
- Se muestra claramente en el formulario de pedido
- Pago al momento de recibir la entrega
- Información visible en la confirmación del pedido

---

## 🤖 IA de Mercadeo

### Acceso Directo
- Botón **"🤖 IA de Mercadeo"** en el header
- Link directo al ChatGPT personalizado
- Se abre en nueva pestaña
- URL: https://chatgpt.com/g/g-69846cf9e5488191a673f07dedddb4f9-ia-de-mercadeo-pcb

### Funcionalidad
- Asistente inteligente para consultas
- Ayuda con pedidos y productos
- Disponible 24/7

---

## ✅ Mensaje de Confirmación Mejorado

### Nuevo Mensaje
**"¡Gracias por tu pedido! En breve se te estará entregando"**

### Características
- ✅ Icono animado (bounce)
- ⏱️ Tiempo estimado de entrega: 15-30 minutos
- 📋 Resumen completo del pedido
- 💵 Recordatorio del método de pago
- 👥 Información de división de cuenta (si aplica)
- 🛒 Botón para hacer otro pedido

---

## 🎨 Mejoras Adicionales Implementadas

### Interfaz de Usuario
- 🔍 **Búsqueda de productos** en tiempo real
- 🏷️ **Filtros por categoría** (Todos, Dulces, Chocolates, Bebidas, Snacks)
- ❤️ **Sistema de favoritos** (guardado en navegador)
- ⭐ **Etiquetas "Popular"** en productos destacados
- ✓ **Indicador de productos en carrito**

### Carrito Mejorado
- ➕➖ **Botones +/-** para ajustar cantidades
- 🗑️ **Botón "Vaciar carrito"**
- 📊 **Contador total de items** (no solo productos únicos)
- 💰 **Subtotales por producto**
- 📱 **Panel lateral en móvil**

### Experiencia de Usuario
- 🎯 **Añadir múltiples veces** el mismo producto
- 💫 **Animaciones suaves** y feedback visual
- 🌈 **Notificaciones coloridas** (verde=éxito, azul=info, rojo=error)
- 📜 **Scrollbar personalizado**
- 🎨 **Efectos hover mejorados**

---

## 📱 Responsive Design

- ✅ Optimizado para móviles, tablets y desktop
- ✅ Carrito lateral en móvil
- ✅ Botones táctiles grandes
- ✅ Navegación intuitiva

---

## 🔒 Seguridad

- JWT con expiración de 24 horas
- Validación de credenciales
- Protección del panel de administración
- Datos guardados localmente

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Estilos:** Tailwind CSS
- **Autenticación:** JWT (simulado client-side)
- **Storage:** localStorage
- **Fuentes:** Google Fonts (Poppins, Quicksand)

---

## 📝 Notas Importantes

1. Los productos se guardan en **localStorage** del navegador
2. Los cambios en el admin se reflejan inmediatamente en la tienda
3. El token JWT expira después de 24 horas
4. Los favoritos se guardan por navegador
5. La división de cuenta es opcional

---

## 🎯 Próximas Mejoras Sugeridas

- Integración con backend real
- Base de datos para productos y pedidos
- Sistema de notificaciones push
- Historial de pedidos
- Reportes y analytics
- Integración con ATH Móvil

---

**Desarrollado para Escuela Superior Vocacional Pablo Colón Berdecia (EVPPCB)**

