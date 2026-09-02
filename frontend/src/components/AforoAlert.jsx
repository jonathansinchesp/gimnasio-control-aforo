import React from 'react';

const AforoAlert = ({ porcentaje }) => {
    if (porcentaje >= 100) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 animate-pulse rounded-r-md shadow-sm" role="alert">
                <p className="font-bold">🚨 AFORO COMPLETO</p>
                <p className="text-sm">Capacidad máxima alcanzada. No se permiten más ingresos.</p>
            </div>
        );
    }

    if (porcentaje >= 80) {
        return (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-r-md shadow-sm" role="alert">
                <p className="font-bold">⚠️ AFORO ELEVADO</p>
                <p className="text-sm">El gimnasio está al {porcentaje}% de su capacidad.</p>
            </div>
        );
    }

    return null;
};

export default AforoAlert;
