// src/services/api.js
const API_BASE = 'http://localhost:4000';

// Obtener token del localStorage
const getToken = () => localStorage.getItem('token');

// Headers con autenticación
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

// Llamadas de API genéricas
export const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: getHeaders()
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la solicitud');
  }

  return data;
};

// ===== LÁMINAS =====
export const obtenerLaminas = () => apiCall('/laminas');
export const crearLamina = (body) => apiCall('/laminas', 'POST', body);
export const actualizarLamina = (id, body) => apiCall(`/laminas/${id}`, 'PUT', body);
export const eliminarLamina = (id) => apiCall(`/laminas/${id}`, 'DELETE');

// ===== TIPOS DE LÁMINA =====
export const obtenerTipoLaminas = () => apiCall('/tipo-laminas');
export const crearTipoLamina = (body) => apiCall('/tipo-laminas', 'POST', body);
export const actualizarTipoLamina = (id, body) => apiCall(`/tipo-laminas/${id}`, 'PUT', body);
export const eliminarTipoLamina = (id) => apiCall(`/tipo-laminas/${id}`, 'DELETE');

// ===== MÁQUINAS =====
export const obtenerMaquinas = () => apiCall('/maquinas');
export const crearMaquina = (body) => apiCall('/maquinas', 'POST', body);
export const actualizarMaquina = (id, body) => apiCall(`/maquinas/${id}`, 'PUT', body);
export const eliminarMaquina = (id) => apiCall(`/maquinas/${id}`, 'DELETE');

// ===== CORTES =====
export const obtenerCortes = () => apiCall('/cortes');
export const crearCorte = (body) => apiCall('/cortes', 'POST', body);
export const actualizarCorte = (id, body) => apiCall(`/cortes/${id}`, 'PUT', body);
export const eliminarCorte = (id) => apiCall(`/cortes/${id}`, 'DELETE');

// ===== RETAZOS =====
export const obtenerRetazos = () => apiCall('/retazos');
export const crearRetazo = (body) => apiCall('/retazos', 'POST', body);
export const actualizarRetazo = (id, body) => apiCall(`/retazos/${id}`, 'PUT', body);
export const eliminarRetazo = (id) => apiCall(`/retazos/${id}`, 'DELETE');

// ===== USUARIOS =====
export const obtenerUsuarios = () => apiCall('/usuarios');
export const obtenerUsuarioPorId = (id) => apiCall(`/usuarios/${id}`);
export const actualizarUsuario = (id, body) => apiCall(`/usuarios/${id}`, 'PUT', body);
export const cambiarContrasena = (id, body) => apiCall(`/usuarios/${id}/cambiar-contrasena`, 'PUT', body);
export const eliminarUsuario = (id) => apiCall(`/usuarios/${id}`, 'DELETE');

// ===== ALERTAS =====
export const obtenerAlertasLowStock = (threshold) => apiCall(`/alertas/low-stock${threshold ? `?threshold=${threshold}` : ''}`);
export const obtenerAlertas = () => apiCall('/alertas');
export const marcarAlertaLeida = (id) => apiCall(`/alertas/${id}/leer`, 'POST');
