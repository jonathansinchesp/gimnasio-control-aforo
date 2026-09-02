import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { useReportes } from '../hooks/useReportes';
import {
    FiCalendar,
    FiDownload,
    FiFileText,
    FiFile,
    FiUsers,
    FiTrendingUp,
    FiClock,
    FiUserCheck
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const Reportes = () => {
    const {
        reporte,
        loading,
        generarReporte,
        exportarCSV,
        exportarPDF,
        getDefaultDates
    } = useReportes();

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tipoReporte, setTipoReporte] = useState('diario');

    // Inicializar fechas
    useEffect(() => {
        const { fechaInicio: inicio, fechaFin: fin } = getDefaultDates();
        setFechaInicio(inicio);
        setFechaFin(fin);
    }, [getDefaultDates]);

    const handleGenerarReporte = async (e) => {
        e.preventDefault();
        if (!fechaInicio || !fechaFin) {
            alert('Por favor, selecciona las fechas');
            return;
        }
        await generarReporte(fechaInicio, fechaFin, tipoReporte);
    };

    const handleExportarCSV = async () => {
        if (!fechaInicio || !fechaFin) return;
        await exportarCSV(fechaInicio, fechaFin);
    };

    const handleExportarPDF = () => {
        if (!reporte) return;
        exportarPDF(reporte, fechaInicio, fechaFin);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return format(parseISO(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    const stats = reporte?.estadisticas || {};

    return (
        <Layout>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Módulo de Reportes
                </h2>

                {/* Formulario de filtros */}
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleGenerarReporte} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Reporte
                            </label>
                            <select
                                value={tipoReporte}
                                onChange={(e) => setTipoReporte(e.target.value)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="diario">Diario</option>
                                <option value="semanal">Semanal</option>
                                <option value="mensual">Mensual</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Generando...' : 'Generar Reporte'}
                            </button>
                        </div>
                    </form>
                </div>

                {loading && <Loading />}

                {reporte && !loading && (
                    <div className="space-y-6">
                        {/* Tarjetas de estadísticas */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            <div className="bg-white shadow rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                                        <FiFileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs text-gray-500">Total Registros</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {stats.totalRegistros || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                                        <FiUserCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs text-gray-500">Entradas</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {stats.totalEntradas || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-red-100 rounded-md p-2">
                                        <FiUsers className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs text-gray-500">Salidas</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {stats.totalSalidas || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                                        <FiUsers className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs text-gray-500">Socios Únicos</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {stats.sociosUnicos || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                                        <FiClock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs text-gray-500">Tiempo Promedio</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {reporte.tiempoPromedioEstancia || 0} min
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Horas pico */}
                        {reporte.horasPico && reporte.horasPico.length > 0 && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    <FiTrendingUp className="inline mr-2 text-blue-600" />
                                    Horas de Mayor Afluencia
                                </h3>
                                <div className="space-y-2">
                                    {reporte.horasPico.map((hora, index) => (
                                        <div key={index} className="flex items-center">
                                            <span className="w-32 text-sm text-gray-600">{hora.hora}</span>
                                            <div className="flex-1 ml-4">
                                                <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                                                        style={{
                                                            width: `${Math.min((hora.ingresos / reporte.horasPico[0].ingresos) * 100, 100)}%`,
                                                            transition: 'width 0.5s ease-in-out'
                                                        }}
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-white">
                                                        {hora.ingresos} ingresos
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Últimas sesiones */}
                        {reporte.sesiones && reporte.sesiones.length > 0 && (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Detalle de Sesiones
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Socio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Entrada
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Salida
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duración
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {reporte.sesiones.slice(0, 10).map((sesion, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {sesion.socio || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatFecha(sesion.entrada)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatFecha(sesion.salida)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {sesion.tiempo} min
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {reporte.sesiones.length > 10 && (
                                    <div className="px-6 py-3 text-sm text-gray-500 border-t border-gray-200">
                                        Mostrando 10 de {reporte.sesiones.length} sesiones
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Botones de exportación */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleExportarCSV}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FiFile className="mr-2" />
                                Exportar a CSV
                            </button>
                            <button
                                onClick={handleExportarPDF}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <FiDownload className="mr-2" />
                                Exportar a PDF
                            </button>
                        </div>
                    </div>
                )}

                {!reporte && !loading && (
                    <div className="text-center py-12 bg-white shadow rounded-lg">
                        <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Selecciona un rango de fechas y genera un reporte
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Reportes;