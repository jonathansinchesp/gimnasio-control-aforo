import React, { useState } from 'react';
import Layout from '../components/Layout';
import QrScanner from '../components/QrScanner';
import { accesoService } from '../services/services';
import { FiUserCheck, FiUserX, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ControlAcceso = () => {
    const [resultado, setResultado] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [capacidadMaxima, setCapacidadMaxima] = useState(100);
    const [configurando, setConfigurando] = useState(false);

    // Función que procesa de inmediato la captura de datos del QR de la cámara o input
    const handleScan = async (data) => {
        setProcessing(true);
        try {
            const response = await accesoService.validar(data);
            const { message, code, data: responseData } = response.data;

            setResultado({
                message,
                code,
                data: responseData,
                success: code === 'ACCESO_PERMITIDO' || code === 'SALIDA_REGISTRADA'
            });

            if (code === 'ACCESO_PERMITIDO') {
                toast.success(message);
            } else if (code === 'SALIDA_REGISTRADA') {
                toast.info(message);
            } else {
                toast.error(message);
            }

        } catch (error) {
            const message = error.response?.data?.message || 'Error al procesar el acceso';
            setResultado({
                message,
                success: false,
                code: error.response?.data?.code || 'ERROR'
            });
            toast.error(message);
        } finally {
            setProcessing(false);
        }
    };

    const handleConfigurarAforo = async (e) => {
        e.preventDefault();
        setConfigurando(true);
        try {
            await accesoService.configurarAforo(capacidadMaxima);
            toast.success('Capacidad máxima actualizada correctamente');
        } catch (error) {
            toast.error('Error al configurar el aforo en la base de datos');
        } finally {
            setConfigurando(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Título de la sección */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Control de Acceso
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Módulo operativo para validación de accesos perimetrales mediante lector QR.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tarjeta del Escáner QR */}
                    <div className="bg-white shadow rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            📷 Escanear Código QR
                        </h3>

                        <div className="max-w-md mx-auto">
                            <QrScanner
                                onScanSuccess={handleScan}
                                onScanError={(err) => console.error('Error de inicialización de cámara:', err)}
                            />
                        </div>

                        {processing && (
                            <div className="text-center text-sm font-medium text-blue-600 animate-pulse mt-2">
                                🔄 Procesando acceso en Supabase...
                            </div>
                        )}

                        {/* Visualizador de Resultados de la validación */}
                        {resultado && !processing && (
                            <div className={`p-4 rounded-lg border transition-all duration-300 ${
                                resultado.success
                                    ? 'bg-green-50 border-green-200 shadow-sm'
                                    : 'bg-red-50 border-red-200 shadow-sm'
                            }`}>
                                <div className="flex items-start">
                                    {resultado.success ? (
                                        <FiUserCheck className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <FiUserX className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="space-y-1">
                                        <p className={`font-bold text-base ${
                                            resultado.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {resultado.message}
                                        </p>
                                        {resultado.data?.socio && (
                                            <p className="text-sm text-gray-700">
                                                👤 Socio: <span className="font-semibold text-gray-900">{resultado.data.socio.nombre}</span>
                                            </p>
                                        )}
                                        {resultado.data?.aforo && (
                                            <p className="text-xs text-gray-600 mt-1 bg-white px-2 py-1 rounded inline-block border border-gray-100 font-medium">
                                                📊 Aforo actual: {resultado.data.aforo.actual} de {resultado.data.aforo.capacidadMaxima} ({resultado.data.aforo.porcentaje}%)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panel de Configuración de Aforo e Instrucciones Rápidas */}
                    <div className="space-y-6">
                        {/* Configurar aforo */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-1">
                                ⚙️ Configurar Capacidad Máxima
                            </h3>
                            <form onSubmit={handleConfigurarAforo} className="flex items-center space-x-4">
                                <input
                                    type="number"
                                    min="1"
                                    value={capacidadMaxima}
                                    onChange={(e) => setCapacidadMaxima(Number(e.target.value))}
                                    className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={configurando}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer transition-colors duration-150"
                                >
                                    {configurando ? 'Actualizando...' : 'Actualizar'}
                                </button>
                            </form>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                Valor actual en memoria: <span className="text-blue-600 font-semibold">{capacidadMaxima} personas</span>
                            </p>
                        </div>

                        {/* Instrucciones rápidas integradas con tu bloque de diseño */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-1.5">
                                📋 Instrucciones Rápidas
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800 font-medium">
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">1.</span>
                                    <span>Coloca el código QR del socio frente a la cámara</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">2.</span>
                                    <span>El sistema validará automáticamente la membresía</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">3.</span>
                                    <span>Si el socio está dentro, se registrará su salida</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">4.</span>
                                    <span>Si el aforo está completo, se denegará el ingreso</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ControlAcceso;
