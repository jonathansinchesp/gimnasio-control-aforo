// Importar dependencias
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const socioRoutes = require('./src/routes/socioRoutes');
const accesoRoutes = require('./src/routes/accesoRoutes');
const reporteRoutes = require('./src/routes/reporteRoutes');

// Importar middlewares
const logger = require('./src/middlewares/logger');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de seguridad y rendimiento
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Demasiadas peticiones, por favor intenta más tarde'
    }
});
app.use('/api', limiter);

// Configuración de orígenes permitidos para CORS
const allowedOrigins = [
    'https://gimnasio-control-aforo.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middlewares principales
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como aplicaciones móviles, Postman o curl)
        if (!origin) return callback(null, true);

        // Permitir orígenes explícitos en la lista o cualquier subdominio preview de Vercel
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        } else {
            return callback(null, true); // En desarrollo/pruebas permite el acceso dinámico
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/socios', socioRoutes);
app.use('/api/acceso', accesoRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Control de Aforo',
        version: '2.0.0',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Ruta de salud
app.get('/health', async (req, res) => {
    try {
        await testConnection();
        res.json({
            status: 'OK',
            database: 'conectado',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'desconectado',
            error: error.message
        });
    }
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API lista para recibir peticiones`);
    console.log(`🔌 Verificando conexión a Supabase...`);

    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos
    await syncDatabase();

    console.log('\n📋 Endpoints disponibles:');
    console.log('  POST /api/auth/login - Iniciar sesión');
    console.log('  GET  /api/auth/perfil - Obtener perfil');
    console.log('  GET  /api/socios - Listar socios');
    console.log('  POST /api/socios - Crear socio');
    console.log('  GET  /api/acceso/estado - Estado del aforo');
    console.log('  POST /api/acceso/validar - Validar acceso QR');
    console.log('  GET  /api/reportes - Generar reporte');
    console.log('  GET  /api/reportes/csv - Exportar CSV');
    console.log(`\n✅ Servidor listo en modo ${process.env.NODE_ENV || 'development'}`);
});