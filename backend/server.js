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

// 3. Rate Limiter (Soporta peticiones preflight OPTIONS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    skipOptions: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, intente más tarde.'
    }
});

app.use(limiter);

// 4. Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Carga de Rutas del Sistema
const safeRequire = (path) => {
    try {
        return require(path);
    } catch (e) {
        return null;
    }
};

// Carga exacta apuntando al nombre real de tu archivo en el disco: reporteReotes.js
const accesoRoutes = safeRequire('./src/routes/accesoRoutes') || safeRequire('./routes/accesoRoutes');
const socioRoutes = safeRequire('./src/routes/socioRoutes') || safeRequire('./routes/socioRoutes');
const authRoutes = safeRequire('./src/routes/authRoutes') || safeRequire('./routes/authRoutes');
const reporteRoutes = safeRequire('./src/routes/reporteReotes') || safeRequire('./routes/reporteReotes') || safeRequire('./src/routes/reporteRoutes');

if (accesoRoutes) app.use('/api/acceso', accesoRoutes);
if (socioRoutes) app.use('/api/socios', socioRoutes);
if (authRoutes) app.use('/api/auth', authRoutes);

if (reporteRoutes) {
    app.use('/api/reportes', reporteRoutes);
    app.use('/reportes', reporteRoutes);
}

// Health Check
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
        console.log(`Servidor activo en puerto ${PORT}`);
    });
}

module.exports = app;