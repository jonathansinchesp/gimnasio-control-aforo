const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. Configuración de Trust Proxy (Indispensable para Render/Vercel)
app.set('trust proxy', 1);

// 2. Configuración de CORS
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Configuración de Rate Limiter (Evita bloqueos 429 en peticiones preflight OPTIONS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 2000,
    skipOptions: true, // Omite validaciones preflight (OPTIONS)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
    }
});

app.use(limiter);

// 4. Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Carga de Rutas del Sistema
try {
    // Intento 1: Buscar rutas dentro de ./src/routes/
    app.use('/api/acceso', require('./src/routes/accesoRoutes'));
    app.use('/api/socios', require('./src/routes/socioRoutes'));
    app.use('/api/auth', require('./src/routes/authRoutes'));
    app.use('/api/reportes', require('./src/routes/reporteRoutes'));
} catch (e) {
    try {
        // Intento 2: Buscar rutas dentro de ./routes/
        app.use('/api/acceso', require('./routes/accesoRoutes'));
        app.use('/api/socios', require('./routes/socioRoutes'));
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/reportes', require('./routes/reporteRoutes'));
    } catch (err) {
        console.log('Error al cargar módulos de rutas:', err.message);
    }
}

// Ruta de comprobación de estado de la API (Health Check)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 6. Manejador global de errores
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
        console.log(`Servidor iniciado exitosamente en el puerto ${PORT}`);
    });
}

module.exports = app;