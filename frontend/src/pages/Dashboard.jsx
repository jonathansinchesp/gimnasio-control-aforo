import React from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import AforoAlert from '../components/AforoAlert';
import { useDashboard } from '../hooks/useDashboard';
import { FiUsers, FiUserCheck, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
    const { aforo, loading, getColor, getStatusText } = useDashboard();

    if (loading) return <Loading />;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Panel de Control en Tiempo Real
                    </h2>
                    <div className="text-sm text-gray-500 font-medium">
                        ⏱️ Hora Local: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Alertas dinámicas de aforo */}
                <AforoAlert porcentaje={aforo.porcentaje} />

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <FiUsers className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Personas Dentro
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {aforo.actual}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                    <FiUserCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Capacidad Máxima
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {aforo.capacidadMaxima}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                    <FiTrendingUp className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Porcentaje de Ocupación
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {aforo.porcentaje}%
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                    <FiAlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Estado del Aforo
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {getStatusText()}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de progreso de aforo */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Nivel de Ocupación
                        </h3>
                        <div className="relative">
                            <div className="overflow-hidden h-8 text-xs flex rounded bg-gray-200">
                                <div
                                    style={{
                                        width: `${Math.min(aforo.porcentaje, 100)}%`,
                                        transition: 'width 0.5s ease-in-out'
                                    }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getColor()} font-bold`}
                                >
                                    {aforo.porcentaje}%
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
                                <span>0% (Vacío)</span>
                                <span className="text-yellow-600">80% (Elevado)</span>
                                <span className="text-red-600">100% (Lleno)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                📊 Resumen del Día
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                    Ingresos totales: <span className="font-semibold text-gray-900">45</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Personas dentro: <span className="font-semibold text-blue-600">{aforo.actual}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Capacidad utilizada: <span className="font-semibold text-gray-900">{aforo.porcentaje}%</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                ℹ️ Información del Sistema
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                    Estado: <span className="text-green-600 font-semibold">✅ Operativo</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Última actualización: {new Date().toLocaleTimeString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Versión: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">v2.0.0</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
