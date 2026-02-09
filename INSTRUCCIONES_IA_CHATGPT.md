# 🤖 CÓMO CONECTAR LA IA CON CHATGPT

## ✅ **ESTADO ACTUAL:**

Tu panel de IA ya está listo y funcionando con dos modos:

1. **Modo ChatGPT** (requiere API Key) - Respuestas inteligentes del ChatGPT real
2. **Modo Local** (fallback automático) - Respuestas básicas sin necesidad de configuración

---

## 🔑 **OPCIÓN 1: USAR CHATGPT REAL (Recomendado)**

### **Paso 1: Obtener API Key de OpenAI**

1. Ve a: https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Click en **"Create new secret key"**
4. Copia la API Key (empieza con `sk-...`)
5. ⚠️ **IMPORTANTE:** Guárdala en un lugar seguro, solo se muestra una vez

### **Paso 2: Configurar la API Key**

1. Abre el archivo `ai-config.js`
2. Busca la línea:
   ```javascript
   apiKey: 'TU_API_KEY_AQUI',
   ```
3. Reemplázala con tu API Key:
   ```javascript
   apiKey: 'sk-tu-api-key-real-aqui',
   ```
4. Guarda el archivo

### **Paso 3: Probar**

1. Refresca tu navegador
2. Abre el panel de IA (botón 🤖)
3. Escribe un mensaje
4. ¡Listo! Ahora estás usando ChatGPT real

---

## 💰 **COSTOS DE LA API:**

- **GPT-4o:** ~$0.005 por 1,000 tokens (muy barato)
- **Ejemplo:** 100 conversaciones ≈ $0.50 USD
- OpenAI te da **$5 gratis** al crear cuenta nueva

---

## 🆓 **OPCIÓN 2: USAR MODO LOCAL (Sin API Key)**

Si no quieres usar la API, el sistema funciona automáticamente en modo local:

- ✅ No necesitas API Key
- ✅ Funciona offline
- ✅ Respuestas básicas sobre productos
- ❌ Menos inteligente que ChatGPT

**No necesitas hacer nada**, ya está configurado como fallback.

---

## 🎯 **CÓMO FUNCIONA:**

```
Usuario escribe mensaje
        ↓
¿Hay API Key configurada?
        ↓
    SÍ → Usa ChatGPT (inteligente)
        ↓
    NO → Usa IA Local (básica)
```

---

## 🔧 **CONFIGURACIÓN AVANZADA (ai-config.js):**

```javascript
const AI_CONFIG = {
  apiKey: 'sk-tu-api-key',        // Tu API Key
  model: 'gpt-4o',                 // Modelo a usar
  maxTokens: 500,                  // Longitud máxima de respuesta
  temperature: 0.7,                // Creatividad (0-1)
};
```

---

## ⚠️ **SEGURIDAD:**

**IMPORTANTE:** En producción, la API Key debe estar en el servidor, NO en el cliente.

Para desarrollo/pruebas está bien, pero para producción necesitas:
1. Un backend (Node.js, Python, etc.)
2. El backend hace las llamadas a OpenAI
3. El frontend solo habla con tu backend

---

## 🎨 **CARACTERÍSTICAS ACTUALES:**

✅ Panel de chat integrado en la página
✅ Diseño moderno y responsive
✅ Historial de conversación (últimos 20 mensajes)
✅ Indicador de "escribiendo..."
✅ Fallback automático a IA local
✅ Botón para abrir en ChatGPT web
✅ Conocimiento de todos los productos de la tienda

---

## 🐛 **SOLUCIÓN DE PROBLEMAS:**

### **"API Key no configurada"**
- Verifica que hayas editado `ai-config.js`
- Asegúrate de que la API Key empiece con `sk-`

### **"API Error: 401"**
- Tu API Key es inválida
- Genera una nueva en OpenAI

### **"API Error: 429"**
- Has excedido tu cuota
- Verifica tu saldo en OpenAI

### **"API Error: 500"**
- Error temporal de OpenAI
- Intenta de nuevo en unos minutos

---

## 📞 **SOPORTE:**

- Documentación OpenAI: https://platform.openai.com/docs
- Precios: https://openai.com/pricing
- Estado del servicio: https://status.openai.com

---

## 🚀 **PRÓXIMOS PASOS:**

1. Obtén tu API Key
2. Configúrala en `ai-config.js`
3. ¡Disfruta de ChatGPT en tu tienda!

Si no quieres usar la API, el modo local funciona perfectamente para uso básico.

