# Contrato de API - Óptica Villalba

## Descripción General
Panel administrativo completo para gestión de promociones del carousel con programación automática por fechas, autenticación MFA y gestión de contenido.

## Datos Mock Actuales a Reemplazar
- `mockPromotions` en `/frontend/src/data/mockData.js`
- `mockBrands` en `/frontend/src/data/mockData.js`
- `mockCompanyInfo` en `/frontend/src/data/mockData.js`

## Modelos de Base de Datos

### 1. Usuarios Admin
```javascript
User {
  id: String,
  username: String,
  password: String (hashed),
  mfaSecret: String,
  mfaEnabled: Boolean,
  lastLogin: DateTime,
  createdAt: DateTime
}
```

### 2. Promociones del Carousel
```javascript
Promotion {
  id: String,
  title: String,
  discount: String,
  type: String, // "Promoción Especial", "Oferta Diaria", etc.
  description: String,
  features: [String], // Array de características
  imageUrl: String,
  isActive: Boolean,
  startDate: DateTime, // Fecha desde cuando se muestra
  endDate: DateTime,   // Fecha hasta cuando se muestra
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### 3. Configuración del Sitio
```javascript
SiteConfig {
  id: String,
  key: String, // "company_name", "tagline", "address", etc.
  value: String,
  updatedAt: DateTime
}
```

### 4. Marcas
```javascript
Brand {
  id: String,
  name: String,
  color: String, // Color hex de la marca
  textColor: String,
  description: String,
  isActive: Boolean,
  order: Number, // Para ordenar las marcas
  createdAt: DateTime
}
```

## Endpoints de API

### Autenticación
- `POST /api/auth/login` - Login inicial con username/password
- `POST /api/auth/verify-mfa` - Verificación MFA con código de 6 dígitos
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Obtener datos del usuario actual

### Promociones (Protegidas)
- `GET /api/promotions` - Obtener todas las promociones
- `GET /api/promotions/active` - Obtener solo promociones activas y dentro de fechas
- `POST /api/promotions` - Crear nueva promoción
- `PUT /api/promotions/:id` - Actualizar promoción
- `DELETE /api/promotions/:id` - Eliminar promoción
- `POST /api/promotions/:id/image` - Subir imagen de promoción

### Configuración del Sitio (Protegidas)
- `GET /api/site-config` - Obtener toda la configuración
- `PUT /api/site-config` - Actualizar configuración del sitio

### Marcas (Protegidas)
- `GET /api/brands` - Obtener todas las marcas
- `POST /api/brands` - Crear nueva marca
- `PUT /api/brands/:id` - Actualizar marca
- `DELETE /api/brands/:id` - Eliminar marca

### Archivos (Protegidas)
- `POST /api/upload/image` - Subir imagen general
- `DELETE /api/upload/image` - Eliminar imagen

## Endpoints Públicos (Frontend)
- `GET /api/public/promotions` - Promociones activas según fechas
- `GET /api/public/brands` - Marcas activas
- `GET /api/public/site-config` - Configuración pública del sitio

## Funcionalidades Especiales

### Sistema de Fechas Automático
- Cron job que corre cada hora para verificar fechas
- Automáticamente activa promociones cuando llega `startDate`
- Automáticamente desactiva promociones cuando pasa `endDate`
- Logs de activaciones/desactivaciones automáticas

### Sistema de Archivos
- Carpeta `/uploads` para imágenes
- Validación de tipos de archivo (jpg, png, webp)
- Redimensionamiento automático para optimizar carga
- Eliminación automática de archivos huérfanos

### Seguridad
- JWT tokens con expiración
- MFA obligatorio con Google Authenticator
- Rate limiting en endpoints de auth
- Validación de permisos en todos los endpoints protegidos
- Sanitización de inputs

## Panel Admin Routes (Frontend)
- `/admin/login` - Página de login
- `/admin/dashboard` - Dashboard principal
- `/admin/promotions` - Gestión de promociones
- `/admin/promotions/new` - Crear promoción
- `/admin/promotions/edit/:id` - Editar promoción
- `/admin/brands` - Gestión de marcas
- `/admin/settings` - Configuración del sitio

## Integración Frontend-Backend

### Remover Mock Data
1. Eliminar archivos mock
2. Crear servicio API para consumir endpoints
3. Implementar estado global (Context) para datos
4. Loading states y error handling
5. Actualización en tiempo real del carousel

### Manejo de Estados
- Loading spinner durante carga de promociones
- Error boundaries para fallos de API
- Cache local de datos para mejor UX
- Refresh automático cada X minutos

## Cronograma de Implementación

### Fase 1: Backend Base
1. Modelos de base de datos
2. Sistema de autenticación básico
3. CRUD de promociones
4. Endpoints públicos

### Fase 2: Panel Admin
1. Sistema MFA completo
2. Interfaz de gestión de promociones
3. Sistema de subida de archivos
4. Calendario para fechas

### Fase 3: Automatización
1. Cron jobs para fechas
2. Sistema de logs
3. Optimizaciones
4. Integración completa frontend

## Tecnologías a Usar
- **Backend**: FastAPI, MongoDB, JWT, bcrypt, pyotp (MFA)
- **File Upload**: python-multipart, Pillow (redimensionamiento)
- **Scheduler**: APScheduler o similar
- **Frontend Admin**: React components adicionales, date pickers

## Notas Importantes
- El carousel debe seguir funcionando sin problemas durante la transición
- Implementar fallbacks en caso de que la API no responda
- Mantener la misma estructura visual y diseño actual
- Sistema de backup automático de promociones