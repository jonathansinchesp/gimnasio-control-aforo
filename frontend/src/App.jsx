import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
  );
}

export default App;
