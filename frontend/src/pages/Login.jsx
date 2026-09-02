import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginClick = async () => {
        // Validación manual básica para evitar envíos vacíos
        if (!email || !password) {
            toast.error('Por favor, llene todos los campos');
            return;
        }

        console.log('🔘 ¡Botón presionado de forma segura! Enviando datos al servidor...');
        setLoading(true);

        try {
            const result = await login(email, password);
            console.log('📡 Respuesta recibida en el componente:', result);

            if (result.success) {
                toast.success('Bienvenido al sistema');
                navigate('/dashboard');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('❌ Error capturado en la petición de login:', error);
            toast.error('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Control de Aforo
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sistema de gestión de gimnasios
                    </p>
                </div>

                {/* Cambiado de form a div para evitar recargas automáticas de página */}
                <div className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="ejemplo@gimnasio.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleLoginClick}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Cargando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
