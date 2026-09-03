import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
    const [aforo, setAforo] = useState({
        actual: 0,
        capacidadMaxima: 100,
        porcentaje: 0,
        alerta: 'normal'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAforo = useCallback(async () => {
        try {
            const response = await dashboardService.getEstadoAforo();

            // LÍNEA DE DIAGNÓSTICO TEMPORAL: Imprime en la consola de Chrome la respuesta exacta del servidor
            console.log("DIAGNÓSTICO AFORO:", response?.data);

            // CRUCIAL: Axios guarda la respuesta del servidor en response.data
            if (response && response.data) {
                const apiData = response.data;

                setAforo({
                    actual: apiData.actual ?? 0,
                    capacidadMaxima: apiData.capacidadMaxima ?? 100,
                    porcentaje: apiData.porcentaje ?? 0,
                    alerta: apiData.alerta ?? 'normal'
                });
            }
            setError(null);
        } catch (err) {
            setError('Error al obtener datos del aforo');
            console.error('Error fetching aforo:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Ejecución inmediata al cargar la pantalla
        fetchAforo();

        // Actualizar automáticamente cada 2 segundos en tiempo real (Polleo fluido)
        const interval = setInterval(fetchAforo, 2000);

        return () => clearInterval(interval);
    }, [fetchAforo]);

    const getColor = useCallback(() => {
        if (aforo.porcentaje >= 100) return 'bg-red-500';
        if (aforo.porcentaje >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    }, [aforo.porcentaje]);

    const getStatusText = useCallback(() => {
        if (aforo.porcentaje >= 100) return 'Crítico - Aforo completo';
        if (aforo.porcentaje >= 80) return 'Alto - Cerca del límite';
        if (aforo.porcentaje >= 50) return 'Moderado';
        return 'Bajo - Buen momento para entrenar';
    }, [aforo.porcentaje]);

    return {
        aforo,
        loading,
        error,
        fetchAforo,
        getColor,
        getStatusText
    };
};
