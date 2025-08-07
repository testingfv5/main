# 📋 **Instrucciones de Instalación - Panel Administrativo Óptica Villalba**

## 🚀 **Instalación desde Repositorio GitHub**

### **Paso 1: Clonar el Repositorio**
```bash
git clone https://github.com/testingfv5/main.git
cd main
```

### **Paso 2: Configurar Backend**
```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias de Python
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env  # Si existe, o crear manualmente
```

**Crear archivo `.env` en `/backend/` con:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=optica_villalba
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
```

### **Paso 3: Configurar Frontend Principal** (Opcional)
```bash
# Navegar al directorio frontend principal
cd ../frontend

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env  # Si existe, o crear manualmente
```

**Crear archivo `.env` en `/frontend/` con:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### **Paso 4: Configurar Panel Administrativo** ⭐ (PRINCIPAL)
```bash
# Navegar al directorio del panel admin
cd ../admin

# Instalar dependencias
yarn install

# Las variables de entorno ya están configuradas en .env
```

**Verificar archivo `.env` en `/admin/`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FRONTEND_URL=http://localhost:3000
PORT=3001
```

---

## ▶️ **Ejecutar la Aplicación**

### **Opción 1: Ejecución Completa (Recomendada)**

**Terminal 1 - Backend:**
```bash
cd backend
python server.py
# Backend ejecutándose en: http://localhost:8001
```

**Terminal 2 - Panel Admin:**
```bash
cd admin
yarn start
# Panel Admin ejecutándose en: http://localhost:3001
```

**Terminal 3 - Frontend Principal:** (Opcional)
```bash
cd frontend
yarn start
# Sitio web ejecutándose en: http://localhost:3000
```

### **Opción 2: Solo Panel Admin (Mínima)**
Si solo necesitas el panel admin:

1. **Ejecutar Backend** (Terminal 1):
```bash
cd backend && python server.py
```

2. **Ejecutar Panel Admin** (Terminal 2):
```bash
cd admin && yarn start
```

---

## 🔐 **Primera Configuración**

### **1. Crear Usuario Administrador**
```bash
# Con el backend ejecutándose, hacer una petición POST:
curl -X POST http://localhost:8001/api/admin/auth/create-initial-admin
```

**O usar herramientas como Postman/Insomnia para hacer POST a:**
`http://localhost:8001/api/admin/auth/create-initial-admin`

### **2. Credenciales Iniciales**
```
Usuario: admin
Contraseña: AdminPass123!
```

### **3. Configurar MFA (Obligatorio)**
1. Accede a: `http://localhost:3001`
2. Inicia sesión con las credenciales iniciales
3. Escanea el código QR con **Google Authenticator** o similar
4. Ingresa el código de 6 dígitos para completar la configuración
5. ¡Listo! Ya puedes usar el panel admin

---

## 📁 **Estructura del Proyecto**

```
main/
├── backend/              # API Backend (FastAPI + MongoDB)
│   ├── server.py        # Servidor principal
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   ├── auth.py          # Sistema de autenticación MFA
│   └── requirements.txt # Dependencias Python
│
├── frontend/            # Sitio web principal (React)
│   ├── src/
│   ├── package.json
│   └── .env             # Variables de entorno
│
└── admin/               # Panel Administrativo (React)
    ├── src/
    │   ├── pages/       # Páginas del panel
    │   ├── components/  # Componentes reutilizables
    │   └── contexts/    # Contextos React
    ├── package.json
    └── .env             # Variables de entorno
```

---

## 🌐 **URLs de Acceso**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Panel Admin** | `http://localhost:3001` | 🎯 **Principal** - Gestión completa |
| **API Backend** | `http://localhost:8001/api` | Endpoints de la API |
| **Sitio Web** | `http://localhost:3000` | Sitio web público (opcional) |

---

## 🔧 **Requisitos del Sistema**

### **Software Necesario:**
- **Node.js** (v16 o superior)
- **Yarn** (gestor de paquetes)
- **Python** (3.8 o superior)
- **MongoDB** (local o remoto)

### **Verificar Instalación:**
```bash
node --version    # v16+
yarn --version    # 1.22+
python --version  # 3.8+
mongod --version  # MongoDB server
```

---

## 🎯 **Funcionalidades del Panel Admin**

### **🔐 Autenticación Segura**
- Login con autenticación de 2 factores (MFA)
- Integración con Google Authenticator
- Tokens JWT con expiración automática

### **📝 Gestión de Contenido**
- **Header**: Logo, información de contacto, horarios
- **Info**: Misión, servicios, características  
- **Footer**: Enlaces, redes sociales, copyright
- **General**: Colores, fuentes, configuración global

### **📅 Promociones Automatizadas**
- Crear promociones con fechas de inicio/fin
- **Activación automática** según calendario
- Subida de imágenes con optimización
- Lista de características editables

### **🏷️ Gestión de Marcas**
- CRUD completo con logos personalizados
- Colores por marca
- Ordenamiento por prioridad
- Activación/desactivación masiva

### **👁️ Vista Previa en Tiempo Real**
- Preview instantáneo de cambios
- Vista responsive (Desktop/Mobile)
- Comparación antes/después

---

## 🛠️ **Resolución de Problemas**

### **Error: Puerto ya en uso**
```bash
# Verificar qué proceso usa el puerto
lsof -i :3001  # Para panel admin
lsof -i :8001  # Para backend

# Terminar proceso
kill -9 <PID>
```

### **Error: MongoDB no conecta**
```bash
# Verificar que MongoDB esté ejecutándose
mongod --dbpath /path/to/your/db

# O usar MongoDB Atlas (cloud)
# Actualizar MONGO_URL en backend/.env
```

### **Error: Dependencias faltantes**
```bash
# Reinstalar dependencias
cd admin && rm -rf node_modules && yarn install
cd backend && pip install -r requirements.txt
```

---

## 📞 **Soporte**

Si encuentras algún problema durante la instalación:

1. **Verifica** que todos los servicios estén ejecutándose
2. **Revisa** los logs en la consola de cada terminal
3. **Confirma** que las variables de entorno estén correctas
4. **Asegúrate** de que MongoDB esté accessible

---

## ✅ **Verificación de Instalación Exitosa**

**Sabrás que todo funciona correctamente cuando:**

1. ✅ Puedes acceder a `http://localhost:3001`
2. ✅ Aparece la pantalla de login del panel admin
3. ✅ Puedes iniciar sesión con las credenciales iniciales
4. ✅ Se te solicita configurar MFA con QR code
5. ✅ Después del MFA puedes ver el dashboard

**¡Listo! Ya puedes gestionar tu sitio web sin tocar código.** 🎉

---

*Desarrollado con ❤️ para Óptica Villalba - Panel Administrativo Completo*
