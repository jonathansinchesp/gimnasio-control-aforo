import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { useSocios } from '../hooks/useSocios';
import { QRCodeSVG } from 'qrcode.react';
import { FiArrowLeft, FiClock, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const SocioDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { socios, loading, getHistorial } = useSocios();
    const [socio, setSocio] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    useEffect(() => {
        const socioEncontrado = socios.find(s => s.id === id);
        if (socioEncontrado) {
            setSocio(socioEncontrado);
            cargarHistorial(id);
        }
    }, [id, socios]);

    const cargarHistorial = async (socioId) => {
        setLoadingHistorial(true);
        try {
            const result = await getHistorial(socioId);
            if (result.success) {
                setHistorial(result.data.historial || []);
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return format(parseISO(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    if (loading || !socio) return <Loading />;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Botón volver */}
                <button
                    onClick={() => navigate('/socios')}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FiArrowLeft className="mr-2" />
                    Volver a la lista
                </button>

                {/* Información del socio */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{socio.nombre}</h2>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-gray-600">
                                    <FiMail className="mr-2" />
                                    <span>{socio.email}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <FiPhone className="mr-2" />
                                    <span>{socio.telefono}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <FiCalendar className="mr-2" />
                                    <span>
                                        Membresía vigente hasta: {formatFecha(socio.fechaVencimiento)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    socio.activo
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {socio.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6">
                            <div className="bg-gray-50 p-3 rounded-lg inline-block">
                                <QRCodeSVG
                                    value={socio.codigoQR}
                                    size={120}
                                    level="H"
                                    includeMargin
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center truncate max-w-[120px]">
                                    {socio.codigoQR}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historial de acceso */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                        <FiClock className="mr-2 text-blue-600" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Historial de Acceso
                        </h3>
                        {loadingHistorial && (
                            <span className="ml-3 text-sm text-gray-500">Cargando...</span>
                        )}
                    </div>

                    {historial.length === 0 && !loadingHistorial ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            <p>Este socio no tiene registros de acceso aún</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha y Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {historial.map((registro) => (
                                    <tr key={registro.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatFecha(registro.fechaHora)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    registro.tipo === 'entrada'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {registro.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {registro.estado}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SocioDetalle;