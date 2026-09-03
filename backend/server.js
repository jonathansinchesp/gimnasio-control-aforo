const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. Trust proxy para servidores en la nube (Render/Vercel)
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

// 3. Rate Limiter (evita bloqueos 429 en peticiones preflight OPTIONS)
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

// 4. Middlewares de lectura
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Carga de rutas
try {
    app.use('/api/acceso', require('./src/routes/accesoRoutes'));
    app.use('/api/socios', require('./src/routes/socioRoutes'));
} catch (e) {
    try {
        app.use('/api/acceso', require('./routes/accesoRoutes'));
        app.use('/api/socios', require('./routes/socioRoutes'));
    } catch (err) {
        console.log('Cargando rutas...');
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 6. Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
}

module.exports = app;