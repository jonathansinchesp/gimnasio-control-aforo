// Importar dependencias
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Importar rutas de los diferentes módulos
const authRoutes = require('./src/routes/authRoutes');
const socioRoutes = require('./src/routes/socioRoutes');
const accesoRoutes = require('./src/routes/accesoRoutes');
const reporteRoutes = require('./src/routes/reporteRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registrar enrutadores de la API
app.use('/api/auth', authRoutes);
app.use('/api/socios', socioRoutes);
app.use('/api/acceso', accesoRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba base
app.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Control de Aforo',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Ruta de salud para verificar conexión interna a la DB
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

// Iniciar el servidor Express
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API lista para recibir peticiones`);
    console.log(`🔌 Verificando conexión a Supabase...`);

    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos con las tablas de Supabase
    await syncDatabase();

    // Imprimir mapa de los endpoints disponibles en consola
    console.log('\n📋 Endpoints disponibles:');
    console.log('  POST /api/auth/login - Iniciar sesión');
    console.log('  GET  /api/auth/perfil - Obtener perfil');
    console.log('  GET  /api/socios - Listar socios');
    console.log('  POST /api/socios - Crear socio');
    console.log('  GET  /api/acceso/estado - Estado del aforo');
    console.log('  POST /api/acceso/validar - Validar acceso QR');
    console.log('  GET  /api/reportes - Generar reporte');
    console.log('  GET  /api/reportes/csv - Exportar CSV');
});
