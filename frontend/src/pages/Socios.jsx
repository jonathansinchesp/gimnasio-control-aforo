import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { useSocios } from '../hooks/useSocios';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const Socios = () => {
    const { socios, loading, deleteSocio } = useSocios();
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de desactivar al socio ${nombre}?`)) {
            await deleteSocio(id);
        }
    };

    // Control de seguridad: Si por algún motivo 'socios' no es un arreglo válido, forzarlo a vacío para evitar caídas
    const sociosSeguros = Array.isArray(socios) ? socios : [];

    // Filtrar reactivamente la lista según el input del usuario de forma segura
    const filteredSocios = sociosSeguros.filter(socio => {
        const nombre = socio?.nombre?.toLowerCase() || '';
        const email = socio?.email?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return nombre.includes(term) || email.includes(term);
    });

    // Función de blindaje para formatear fechas sin romper el renderizado de React
    const formatearFecha = (fechaRaw) => {
        if (!fechaRaw) return 'Sin fecha';
        const fecha = new Date(fechaRaw);
        return isNaN(fecha.getTime()) ? 'Fecha inválida' : fecha.toLocaleDateString();
    };

    if (loading) return <Loading />;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Gestión de Socios
                    </h2>
                    <Link
                        to="/socios/nuevo"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                    >
                        <FiPlus className="mr-2" />
                        Nuevo Socio
                    </Link>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative shadow-sm rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar socios por nombre o email..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabla/Lista estructurada de socios */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {filteredSocios.length === 0 ? (
                            <li className="px-6 py-8 text-center text-gray-500 font-medium">
                                🔍 No se encontraron socios registrados
                            </li>
                        ) : (
                            filteredSocios.map((socio) => (
                                <li key={socio?.id || Math.random()} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {socio?.nombre || 'Socio sin nombre'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate mt-0.5">
                                                {socio?.email || 'Socio sin email'} • {socio?.telefono || 'Sin teléfono'}
                                            </p>
                                            <div className="flex items-center space-x-3 mt-1.5">
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    socio?.activo
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {socio?.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    📅 Vence: {formatearFecha(socio?.fechaVencimiento)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botones de acción contextuales */}
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                to={`/socios/${socio?.id}`}
                                                title="Ver Ficha"
                                                className="text-blue-600 hover:text-blue-900 transition-colors duration-150 p-1 hover:bg-blue-50 rounded"
                                            >
                                                <FiEye className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                to={`/socios/editar/${socio?.id}`}
                                                title="Editar"
                                                className="text-yellow-600 hover:text-yellow-900 transition-colors duration-150 p-1 hover:bg-yellow-50 rounded"
                                            >
                                                <FiEdit2 className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(socio?.id, socio?.nombre)}
                                                disabled={!socio?.activo}
                                                title={socio?.activo ? "Desactivar Socio" : "Ya Desactivado"}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default Socios;
