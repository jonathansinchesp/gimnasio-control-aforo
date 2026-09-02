import api from './api'; // Importamos la instancia configurada con tokens JWT

export const dashboardService = {
    // Consulta la telemetría actual de ocupación en el gimnasio
    getEstadoAforo: () => api.get('/acceso/estado'),

    // Consulta opcional para resúmenes gráficos (Endpoint auxiliar)
    getEstadisticasRapidas: () => api.get('/dashboard/estadisticas'),
};
