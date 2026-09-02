import React, { useState } from 'react';
import Layout from '../components/Layout';
import { accesoService } from '../services/socioService'; // Ruta correcta de tus servicios
import { FiUserCheck, FiUserX, FiSettings } from 'react-icons/fi'; // Removido el ícono problemático
import toast from 'react-hot-toast';

const ControlAcceso = () => {
    const [resultado, setResultado] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [capacidadMaxima, setCapacidadMaxima] = useState(100);
    const [configurando, setConfigurando] = useState(false);
    const [qrManual, setQrManual] = useState('');

    const handleProcesarCodigo = async (codigo) => {
        if (!codigo) return;
        setProcessing(true);
        try {
            const response = await accesoService.validar(codigo);
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

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!qrManual) return;
        handleProcesarCodigo(qrManual.trim());
        setQrManual('');
    };

    const handleConfigurarAforo = async (e) => {
        e.preventDefault();
        setConfigurando(true);
        try {
            await accesoService.configurarAforo(capacidadMaxima);
            toast.success('Capacidad máxima actualizada');
        } catch (error) {
            toast.error('Error al configurar el aforo');
        } finally {
            setConfigurando(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Control de Acceso
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Módulo operativo para validación de accesos perimetrales.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Panel de Validación */}
                    <div className="bg-white shadow rounded-lg p-6 space-y-6">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            ⌨️ Validación manual por Teclado
                        </h3>

                        {/* Formulario manual prioritario */}
                        <form onSubmit={handleManualSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Ingresa el código del QR (Ej: QR-ffef6fa3...)"
                                className="block w-full px-3 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={qrManual}
                                onChange={(e) => setQrManual(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={processing || !qrManual}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm disabled:opacity-40 cursor-pointer transition-colors"
                            >
                                {processing ? 'Procesando...' : 'Validar Acceso'}
                            </button>
                        </form>

                        {resultado && (
                            <div className={`p-4 rounded-lg border transition-all ${
                                resultado.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex items-center">
                                    {resultado.success ? (
                                        <FiUserCheck className="h-6 w-6 text-green-600 mr-3" />
                                    ) : (
                                        <FiUserX className="h-6 w-6 text-red-600 mr-3" />
                                    )}
                                    <div>
                                        <p className={`font-bold ${resultado.success ? 'text-green-800' : 'text-red-800'}`}>
                                            {resultado.message}
                                        </p>
                                        {resultado.data?.socio && (
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Socio: <span className="font-semibold text-gray-900">{resultado.data.socio.nombre}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panel de Configuración */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <FiSettings className="text-gray-600" /> Configurar Capacidad Máxima
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
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                                >
                                    {configurando ? 'Actualizando...' : 'Actualizar'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">
                                📋 Instrucciones Rápidas
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800 font-medium">
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">1.</span>
                                    <span>Copia el código de texto generado en la sección de Socios.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">2.</span>
                                    <span>Pégalo en la caja de validación por teclado de arriba.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">3.</span>
                                    <span>El sistema alternará automáticamente entre Entrada y Salida.</span>
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
