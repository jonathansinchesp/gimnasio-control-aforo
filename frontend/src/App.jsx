import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Socios from './pages/Socios';
import SocioForm from './pages/SocioForm';
import SocioDetalle from './pages/SocioDetalle';
import ControlAcceso from './pages/ControlAcceso';
import Reportes from './pages/Reportes';

// Componente para proteger rutas
const PrivateRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user?.rol !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
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
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />

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
                                <PrivateRoute adminOnly>
                                    <SocioForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/socios/editar/:id"
                            element={
                                <PrivateRoute adminOnly>
                                    <SocioForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/socios/:id"
                            element={
                                <PrivateRoute>
                                    <SocioDetalle />
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

                        <Route
                            path="/reportes"
                            element={
                                <PrivateRoute adminOnly>
                                    <Reportes />
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
