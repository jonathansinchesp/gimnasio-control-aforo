import { useState, useEffect, useCallback } from 'react';
import { socioService } from '../services/socioService';
import toast from 'react-hot-toast';

export const useSocios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadSocios = useCallback(async () => {
        try {
            setLoading(true);
            const response = await socioService.getAll();
            // Validamos que exista la estructura antes de mapearla al estado
            if (response.data && response.data.data) {
                setSocios(response.data.data);
            }
            setError(null);
        } catch (err) {
            setError('Error al cargar los socios');
            toast.error('Error al cargar la lista de socios');
            console.error('Error loading socios:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSocios();
    }, [loadSocios]);

    const createSocio = async (data) => {
        try {
            const response = await socioService.create(data);
            toast.success('Socio registrado exitosamente');
            await loadSocios();
            return { success: true, data: response.data.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al registrar socio';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const updateSocio = async (id, data) => {
        try {
            const response = await socioService.update(id, data);
            toast.success('Socio actualizado exitosamente');
            await loadSocios();
            return { success: true, data: response.data.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al actualizar socio';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const deleteSocio = async (id) => {
        try {
            await socioService.delete(id);
            toast.success('Socio desactivado exitosamente');
            await loadSocios();
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al desactivar socio';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const getHistorial = async (id) => {
        try {
            const response = await socioService.getHistorial(id);
            return { success: true, data: response.data?.data || null };
        } catch (err) {
            toast.error('Error al cargar el historial');
            return { success: false, error: err.response?.data?.message };
        }
    };

    return {
        socios,
        loading,
        error,
        loadSocios,
        createSocio,
        updateSocio,
        deleteSocio,
        getHistorial
    };
};
