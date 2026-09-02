import React, { useState } from 'react';
import QrReader from 'react-qr-scanner'; // Corrección: Importación por defecto sin llaves para react-qr-scanner

const QrScanner = ({ onScanSuccess, onScanError }) => {
    const [scanning, setScanning] = useState(true);

    const handleScan = (data) => {
        // react-qr-scanner devuelve un objeto con la propiedad text o el string directo
        if (data) {
            const qrText = typeof data === 'object' ? data.text : data;
            if (qrText) {
                setScanning(false);
                onScanSuccess(qrText);
            }
        }
    };

    const handleError = (err) => {
        console.error('Error del Escáner QR de la cámara:', err);
        if (onScanError) {
            onScanError(err);
        }
    };

    return (
        <div className="relative">
            {scanning ? (
                <div className="bg-black rounded-lg overflow-hidden shadow-inner border border-gray-800">
                    <QrReader
                        delay={300}
                        onError={handleError}
                        onScan={handleScan} // Corrección: Propiedad nativa de escucha de react-qr-scanner
                        facingMode="environment" // Usa la cámara trasera en dispositivos móviles
                        className="w-full h-auto max-w-sm mx-auto"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-blue-500 pointer-events-none opacity-40 animate-pulse m-8 rounded"></div>
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-700 font-medium">✨ Código capturado con éxito</p>
                    <button
                        type="button"
                        onClick={() => setScanning(true)}
                        className="mt-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow-sm transition-colors duration-200 cursor-pointer"
                    >
                        Escanear Siguiente Código
                    </button>
                </div>
            )}
        </div>
    );
};

export default QrScanner;
