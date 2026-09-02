import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Socios from './pages/Socios';
import SocioForm from './pages/SocioForm';
import ControlAcceso from './pages/ControlAcceso';

// Componente para proteger rutas operativas
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500 font-medium">Cargando módulos...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    {/* Alertas personalizadas oscuras */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                    <Routes>
                        {/* Ruta Pública */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />

                        {/* Rutas Privadas Protegidas */}
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/socios"
                            element={
                                <PrivateRoute>
                                    <Socios />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/socios/nuevo"
                            element={
                                <PrivateRoute>
                                    <SocioForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/socios/editar/:id"
                            element={
                                <PrivateRoute>
                                    <SocioForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/acceso"
                            element={
                                <PrivateRoute>
                                    <ControlAcceso />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
