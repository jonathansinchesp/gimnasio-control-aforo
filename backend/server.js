// Importar dependencias
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos y sincronización de modelos
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Importar enrutadores
const authRoutes = require('./src/routes/authRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registrar rutas de la API de forma explícita
app.use('/api/auth', authRoutes);


// Ruta de prueba base
app.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Control de Aforo',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Ruta de salud para verificar la conexión interna a la DB
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

// Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API lista para recibir peticiones`);
    console.log(`🔌 Verificando conexión a Supabase...`);

    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos con las tablas de Supabase
    await syncDatabase();
});
