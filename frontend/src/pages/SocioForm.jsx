import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useSocios } from '../hooks/useSocios';
import { QRCodeSVG } from 'qrcode.react'; // Asegura la importación del renderizador de QR
import toast from 'react-hot-toast';

const SocioForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createSocio, updateSocio, getHistorial } = useSocios();

    const isEdit = !!id;
    const [submitting, setSubmitting] = useState(false);
    const [qrCode, setQrCode] = useState('');

    // Estado base para capturar el formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        fechaVencimiento: '',
        activo: true
    });

    // Si es edición, cargamos previamente los datos actuales del socio en Supabase
    useEffect(() => {
        if (isEdit) {
            const cargarSocio = async () => {
                const response = await getHistorial(id);
                if (response.success && response.data.socio) {
                    const socio = response.data.socio;
                    setFormData({
                        nombre: socio.nombre,
                        email: socio.email,
                        telefono: socio.telefono,
                        fechaVencimiento: socio.fechaVencimiento.split('T')[0],
                        activo: socio.activo
                    });
                    setQrCode(socio.codigoQR);
                }
            };
            cargarSocio();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        let result;
        if (isEdit) {
            result = await updateSocio(id, formData);
        } else {
            result = await createSocio(formData);
            if (result.success && result.data) {
                // Al registrar con éxito, mostramos de inmediato el QR en pantalla
                setQrCode(result.data.codigoQR);
            }
        }

        setSubmitting(false);
        if (result.success && isEdit) {
            navigate('/socios');
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {isEdit ? '✏️ Editar Datos de Socio' : '➕ Registrar Nuevo Socio'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                name="nombre"
                                required
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono móvil</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento Membresía</label>
                                <input
                                    type="date"
                                    name="fechaVencimiento"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                    value={formData.fechaVencimiento}
                                    onChange={handleChange}
                                />
                            </div>
                            {isEdit && (
                                <div className="flex items-center mt-6">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        id="activo"
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={formData.activo}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 font-medium cursor-pointer">Socio Vigente y Activo</label>
                                </div>
                            )}
                        </div>

                        {/* Código QR entregado en tu fragmento de guía */}
                        {qrCode && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Código QR del Socio
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                                    <QRCodeSVG
                                        value={qrCode}
                                        size={150}
                                        level="H"
                                        includeMargin
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-center font-mono">
                                        {qrCode}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/socios')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                            >
                                {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default SocioForm;
