import api from './api';

export const socioService = {
    // Añadimos /api explícito a cada ruta individual para evitar duplicaciones globales
    getAll: () => api.get('/api/socios'),
    getById: (id) => api.get(`/api/socios/${id}`),
    create: (data) => api.post('/api/socios', data),
    update: (id, data) => api.put(`/api/socios/${id}`, data),
    delete: (id) => api.delete(`/api/socios/${id}`),
    getHistorial: (id) => api.get(`/api/socios/${id}/historial`),
};

export const accesoService = {
    getEstado: () => api.get('/api/acceso/estado'),
    validar: (qrCode) => api.post('/api/acceso/validar', { qrCode }),
    configurarAforo: (capacidadMaxima) => api.put('/api/acceso/configurar', { capacidadMaxima })
};
