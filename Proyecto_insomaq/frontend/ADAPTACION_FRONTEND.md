# Adaptación Frontend - Cambios Realizados

## ✅ Completado

### 1. Servicio de API Centralizado
**Archivo:** `src/services/api.js`
- Funciones para todas las entidades: Láminas, Tipos, Máquinas, Cortes, Retazos, Usuarios
- Manejo de token de autenticación automático
- Headers con Bearer token

### 2. Login actualizado
**Archivo:** `src/pages/Login.jsx`
- ✅ Endpoint: `/usuarios/iniciar-sesion` (con guiones)
- ✅ Campo correcto: `contrasena` (sin tilde)
- ✅ Respuesta: Ahora captura `data.data` para usuario completo
- ✅ Recuperar clave: `/usuarios/recuperar-clave`
- ✅ Cambiar contraseña: `/usuarios/:id/cambiar-contrasena`

### 3. Register actualizado  
**Archivo:** `src/pages/Register.jsx`
- ✅ Campo correcto: `contrasena` en el body

## 📋 Checklist Restante (Manual)

### Páginas por actualizar (opcional pero recomendado):
- [ ] `src/pages/Cortes.jsx` - Usar funciones de `api.js`
- [ ] `src/pages/Maquinas.jsx` - Usar funciones de `api.js`
- [ ] `src/pages/Retazos.jsx` - Usar funciones de `api.js`
- [ ] `src/pages/Alertas.jsx` - Si existe

## 🔧 Cómo Reemplazar Inventario.jsx

Como el archivo tiene 272 líneas, la mejor forma es:

1. Copiar el contenido nuevo desde `src/pages/Inventario-nuevo.jsx`
2. O usar VSCode: Abrir archivo, seleccionar todo (Ctrl+A), pegar el contenido nuevo

**Contenido nuevo disponible en:** Copiar desde el prompt anterior (el código completo de Inventario.jsx actualizado)

## 📝 Endpoints del Backend (Resumen)

### Usuarios
- POST `/usuarios/registrarse` - { nombre, email, contrasena }
- POST `/usuarios/iniciar-sesion` - { email, contrasena }
- GET `/usuarios` - (protegido) Lista todos
- GET `/usuarios/:id` - (protegido)
- PUT `/usuarios/:id` - (protegido)
- PUT `/usuarios/:id/cambiar-contrasena` - (protegido)
- DELETE `/usuarios/:id` - (protegido)

### Láminas
- GET `/laminas` - Con relación a tipo_lamina
- POST `/laminas` - { id_tipo, ancho, largo, stock }
- PUT `/laminas/:id`
- DELETE `/laminas/:id`

### Tipos de Lámina
- GET `/tipo-laminas`
- POST `/tipo-laminas` - { nombre }
- PUT `/tipo-laminas/:id`
- DELETE `/tipo-laminas/:id`

### Máquinas, Cortes, Retazos
- Similar CRUD para cada entidad

## 🚀 Verificación

El servidor backend debe estar corriendo en `http://localhost:4000`

```bash
# Desde backend
cd D:\Desktop\Proyecto-Formativo\Proyecto_insomaq\backend
node app.js
```

El frontend debe estar corriendo en `http://localhost:3000`

```bash
# Desde frontend
cd D:\Desktop\Proyecto-Formativo\Proyecto_insomaq\frontend
npm start
```
