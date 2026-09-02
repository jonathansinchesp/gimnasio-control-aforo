import api from './api'; // Importamos la instancia central configurada con interceptores de Axios

export const socioService = {
    // Listar todos los socios registrados
    getAll: () => api.get('/socios'),

    // Consultar la información de un socio específico
    getById: (id) => api.get(`/socios/${id}`),

    // Registrar un nuevo socio en el gimnasio
    create: (data) => api.post('/socios', data),

    // Modificar los datos de un socio existente
    update: (id, data) => api.put(`/socios/${id}`, data),

    // Desactivar a un socio del sistema (Soft Delete)
    delete: (id) => api.delete(`/socios/${id}`),

    // Consultar el historial individual de entradas y salidas de un cliente
    getHistorial: (id) => api.get(`/socios/${id}/historial`),
};

export const accesoService = {
    // Consulta la telemetría actual de ocupación en el gimnasio
    getEstado: () => api.get('/acceso/estado'),

    // Enviar código QR para validar entrada/salida automática
    validar: (qrCode) => api.post('/acceso/validar', { qrCode }),

    // Modificar capacidad límite del aforo en tiempo real (Solo Administradores)
    configurarAforo: (capacidadMaxima) => api.put('/acceso/configurar', { capacidadMaxima })
};
