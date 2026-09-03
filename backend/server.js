const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. Seguridad HTTP
app.use(helmet());

// 2. Configuración de CORS para Vercel y clientes externos
app.use(cors({
    origin: '*', // O reemplaza con tu dominio de Vercel: 'https://gimnasio-control-aforo.vercel.app'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiter (Optimizado para evitar bloqueos CORS/Preflight 429)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'development' ? 10000 : 500, // Límite amplio para evitar falsos positivos
    skipOptions: true, // ¡CRÍTICO! Omite validación en peticiones OPTIONS (Preflight)
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP. Por favor, intente más tarde.'
    }
});

app.use(limiter);

// 4. Middlewares para parsear el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// 5. Rutas de la API
app.use('/api/acceso', require('./routes/accesoRoutes'));
// Importa y usa aquí tus otras rutas (ej. /api/socios, /api/auth, etc.)

// Ruta Health Check para monitoreo
app.get('/health', (req, res) => {
    res.json({ status: 'OK', database: 'conectado', timestamp: new Date() });
});

// 6. Manejo de errores globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
}

module.exports = app;