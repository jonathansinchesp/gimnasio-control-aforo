import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    // Traemos user y logout del contexto global de autenticación
    const { user, logout } = useAuth();
    const [aforo, setAforo] = useState({
        actual: 0,
        capacidadMaxima: 100,
        porcentaje: 0,
        alerta: 'normal'
    });
    const [loading, setLoading] = useState(true);

    const fetchAforo = async () => {
        try {
            const response = await api.get('/api/aforo/estado');
            setAforo(response.data);
        } catch (error) {
            console.error('Error al obtener aforo:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAforo();
        const interval = setInterval(fetchAforo, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogoutClick = () => {
        logout(); // Limpia el localStorage y el estado
        toast.success('Sesión cerrada correctamente');
    };

    const getColor = () => {
        if (aforo.porcentaje >= 100) return 'bg-red-500';
        if (aforo.porcentaje >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <div className="text-sm text-gray-600 mt-1">
                                Bienvenido, <span className="font-semibold text-blue-600">{user?.nombre}</span> ({user?.rol})
                            </div>
                        </div>

                        {/* Botón de Cerrar Sesión */}
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-md shadow-sm transition-colors duration-200 cursor-pointer"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                <main className="px-4 sm:px-6 lg:px-8">
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Aforo Actual</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{aforo.actual}</dd>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Capacidad Máxima</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{aforo.capacidadMaxima}</dd>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Ocupación</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{aforo.porcentaje}%</dd>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="relative">
                                <div className="overflow-hidden h-8 text-xs flex rounded bg-gray-200">
                                    <div
                                        style={{ width: `${Math.min(aforo.porcentaje, 100)}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getColor()} transition-all duration-500`}
                                    >
                                        {aforo.porcentaje}%
                                    </div>
                                </div>
                                {aforo.porcentaje >= 80 && (
                                    <div className="absolute top-0 right-0 mt-1 mr-2 text-sm font-bold text-red-600 animate-pulse">
                                        ⚠️ ALERTA
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
