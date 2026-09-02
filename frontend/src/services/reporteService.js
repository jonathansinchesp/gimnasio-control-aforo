import api from './api'; // Importamos la instancia central configurada con tokens JWT

export const reporteService = {
    // Generar reporte analítico en JSON (Añadido /api/ de forma explícita)
    generar: (fechaInicio, fechaFin, tipo = 'diario') =>
        api.get('/api/reportes', {
            params: { fechaInicio, fechaFin, tipo }
        }),

    // Exportar bitácora a formato descargable CSV (Excel)
    exportarCSV: (fechaInicio, fechaFin) =>
        api.get('/api/reportes/csv', {
            params: { fechaInicio, fechaFin },
            responseType: 'blob' // Esencial para que el navegador interprete el archivo descargable
        }),

    // Preparar estructura base para la exportación nativa a PDF
    exportarPDF: (data) => {
        return new Promise((resolve, reject) => {
            try {
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
};
