// Importar dependencias
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Control de Aforo',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Ruta de salud para verificar conexión a DB
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

    // Sincronizar modelos
    await syncDatabase();
});
