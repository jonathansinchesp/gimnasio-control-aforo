import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUsers, FiHome, FiBarChart2, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        logout();
        toast.success('Sesión cerrada exitosamente');
        navigate('/login');
    };

    const isAdmin = user?.rol === 'admin';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Barra de navegación */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-blue-600">
                                    🏋️ GymControl
                                </h1>
                            </div>
                            <div className="hidden md:block ml-6">
                                <div className="flex space-x-4">
                                    <Link
                                        to="/dashboard"
                                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    >
                                        <FiHome className="inline mr-1" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/socios"
                                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    >
                                        <FiUsers className="inline mr-1" />
                                        Socios
                                    </Link>
                                    <Link
                                        to="/acceso"
                                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    >
                                        <FiSettings className="inline mr-1" />
                                        Control de Acceso
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/reportes"
                                            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        >
                                            <FiBarChart2 className="inline mr-1" />
                                            Reportes
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user?.nombre} ({user?.rol})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                <FiLogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
