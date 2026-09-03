const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. Indicar que el servidor está detrás de un Proxy (Render/Heroku/Vercel)
// Esto evita falsos positivos del Rate Limiter en producción
app.set('trust proxy', 1);

// 2. Configurar CORS (DEBE IR ANTES DE CUALQUIER LIMITADOR)
const corsOptions = {
    origin: '*', // O tu dominio exacto de Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

// Responder inmediatamente a todas las peticiones Preflight (OPTIONS)
app.options('*', cors(corsOptions));

// 3. Configurar Rate Limiter (Soportando OPTIONS y proxies)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 2000, // Límite amplio de peticiones por ventana
    skipOptions: true, // ¡CRÍTICO! Salta las comprobaciones en peticiones OPTIONS
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
    }
});

// Aplicar el limitador globalmente
app.use(limiter);

// 4. Middlewares de lectura del Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// 5. Rutas de la API
// Asegúrate de requerir tus rutas según la estructura de tu proyecto
app.use('/api/acceso', require('./routes/accesoRoutes'));

// Si tienes un archivo separado para socios, impórtalo aquí:
// app.use('/api/socios', require('./routes/sociosRoutes'));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 6. Manejador de errores
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
        console.log(`Servidor activo en el puerto ${PORT}`);
    });
}

module.exports = app;