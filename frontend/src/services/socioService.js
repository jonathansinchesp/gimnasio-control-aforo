import api from './api'; // Importamos la instancia configurada con tokens JWT

export const socioService = {
    // Listar todos los socios registrados
    getAll: () => api.get('/socios'),

    // Consultar la información de un socio específico
    getById: (id) => api.get(`/socios/${id}`),

    // Registrar un nuevo socio en el gimnasio (Solo Administradores)
    create: (data) => api.post('/socios', data),

    // Modificar los datos de un socio existente (Solo Administradores)
    update: (id, data) => api.put(`/socios/${id}`, data),

    // Desactivar a un socio del sistema (Soft Delete - Solo Administradores)
    delete: (id) => api.delete(`/socios/${id}`),

    // Consultar el historial individual de entradas y salidas de un cliente
    getHistorial: (id) => api.get(`/socios/${id}/historial`),
};
