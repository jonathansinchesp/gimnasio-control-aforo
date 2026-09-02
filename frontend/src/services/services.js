import api from './api'; // Importamos la instancia configurada con interceptores

// Servicios de Autenticación (Login, Logout y Perfil)
export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    getPerfil: () => api.get('/auth/perfil')
};

// Servicios de Socios (CRUD Completo y Bitácora individual)
export const socioService = {
    getAll: () => api.get('/socios'),
    getById: (id) => api.get(`/socios/${id}`),
    create: (data) => api.post('/socios', data),
    update: (id, data) => api.put(`/socios/${id}`, data),
    delete: (id) => api.delete(`/socios/${id}`),
    getHistorial: (id) => api.get(`/socios/${id}/historial`)
};

// Servicios de Acceso (Telemetría de aforo, escáner QR y topes máximos)
export const accesoService = {
    getEstado: () => api.get('/acceso/estado'),
    validar: (qrCode) => api.post('/acceso/validar', { qrCode }),
    configurarAforo: (capacidadMaxima) => api.put('/acceso/configurar', { capacidadMaxima })
};

// Servicios de Reportes (Analíticas de afluencia y descargas en blobs Excel)
export const reporteService = {
    generar: (fechaInicio, fechaFin, tipo) =>
        api.get('/reportes', { params: { fechaInicio, fechaFin, tipo } }),
    exportarCSV: (fechaInicio, fechaFin) =>
        api.get('/reportes/csv', { params: { fechaInicio, fechaFin }, responseType: 'blob' })
};
