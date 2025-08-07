# Panel de Administración - Óptica Villalba

Panel administrativo completo para gestionar el contenido del sitio web de Óptica Villalba.

## 🚀 Características

### 🔐 Seguridad Avanzada
- Autenticación MFA obligatoria con Google Authenticator
- JWT tokens con expiración automática
- Rate limiting para prevenir ataques
- Logs de auditoría completos

### 📝 Gestión de Contenido Sin Código
- Editor visual para todas las secciones del sitio
- Cambios en tiempo real con vista previa
- Gestión completa de textos, imágenes y configuración
- Sistema de backup automático

### 📅 Promociones Automatizadas
- Programación de promociones con fechas específicas
- Activación/desactivación automática
- Calendario intuitivo para gestión
- Subida de imágenes con optimización automática

### 🏷️ Gestión de Marcas
- Administración completa de marcas
- Logos con optimización automática
- Colores personalizados por marca
- Ordenamiento por prioridad

### 👁️ Vista Previa en Tiempo Real
- Preview instantáneo de cambios
- Vista responsive (desktop/mobile)
- Comparación antes/después
- Integración perfecta con el sitio principal

## 🛠️ Tecnologías

- **Frontend**: React 18 + Tailwind CSS
- **Iconos**: Heroicons
- **Componentes**: Headless UI
- **Formularios**: React Hook Form
- **Fechas**: date-fns
- **Uploads**: React Dropzone
- **Notificaciones**: React Hot Toast
- **QR Codes**: qrcode.react

## 📦 Instalación

```bash
# Instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn start

# Construir para producción
yarn build
```

## 🔧 Configuración

### Variables de Entorno

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Primer Uso

1. Crear usuario admin inicial:
```bash
POST /api/admin/auth/create-initial-admin
```

2. Configurar MFA en primer login
3. Inicializar contenido por defecto desde el panel

## 🔒 Seguridad

### Autenticación MFA
- Configuración obligatoria en primer login
- Códigos TOTP estándar (compatible con Google Authenticator, Authy, etc.)
- Backup codes automáticos

### Permisos
- Acceso restringido solo a usuarios autenticados
- Tokens con expiración automática
- Renovación automática de sesiones

### Logs de Auditoría
- Registro completo de todas las acciones administrativas
- Tracking de cambios con timestamp
- Identificación de usuario por acción

## 📱 Uso

### Dashboard
- Vista general del estado del sitio
- Estadísticas en tiempo real
- Accesos rápidos a funciones principales

### Gestión de Contenido
- **Header**: Logo, información de contacto, horarios
- **Info**: Misión, servicios, características
- **Footer**: Enlaces, redes sociales, copyright
- **General**: Colores, fuentes, configuración global

### Promociones
- Creación con fechas de inicio/fin
- Subida de imágenes con optimización
- Lista de características editables
- Estado automático según fechas

### Marcas
- Gestión completa con logos
- Colores personalizados
- Ordenamiento por prioridad
- Activación/desactivación

### Vista Previa
- Preview en tiempo real
- Modo responsive
- Actualización automática
- Apertura en nueva pestaña

## 🎨 Diseño

### Paleta de Colores
- **Primario**: #3b82f6 (Azul)
- **Secundario**: #dc2626 (Rojo)
- **Éxito**: #16a34a (Verde)
- **Advertencia**: #d97706 (Naranja)
- **Error**: #dc2626 (Rojo)

### Responsividad
- Mobile First Design
- Breakpoints estándar de Tailwind
- Sidebar colapsable en mobile
- Componentes adaptativos

## 🔄 Flujo de Trabajo

1. **Login**: Autenticación MFA obligatoria
2. **Dashboard**: Vista general del estado
3. **Edición**: Modificar contenido, promociones, marcas
4. **Preview**: Revisar cambios en tiempo real
5. **Aplicar**: Confirmar cambios cuando estén listos

## 📊 Monitoreo

- Estado de la base de datos
- Uso de almacenamiento de archivos
- Estadísticas de promociones activas
- Logs de actividad administrativa

## 🚀 Despliegue

El panel admin está diseñado para ejecutarse por separado del sitio principal:

- **Admin Panel**: Puerto 3001
- **Sitio Principal**: Puerto 3000
- **Backend API**: Puerto 8001

Esto permite actualizaciones independientes y mayor seguridad.

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar logs en el dashboard
2. Verificar estado del sistema en configuración
3. Usar vista previa para validar cambios
4. Contactar al desarrollador si persisten los problemas

---

**Desarrollado con ❤️ por Óptica Villalba**