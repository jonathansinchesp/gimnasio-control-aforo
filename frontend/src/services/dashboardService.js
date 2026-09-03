import api from './api'; // Importamos la instancia configurada con tokens JWT

export const dashboardService = {
    // Consulta la telemetría actual de ocupación en el gimnasio (Corregido con prefijo /api)
    getEstadoAforo: () => api.get('/api/acceso/estado'),

    // Consulta opcional para resúmenes gráficos (Corregido con prefijo /api)
    getEstadisticasRapidas: () => api.get('/api/dashboard/estadisticas'),
};
