const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de Sequelize para Supabase
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // Cambiar a console.log para ver SQL en desarrollo
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a Supabase (PostgreSQL) establecida correctamente.');
    } catch (error) {
        console.error('❌ Error al conectar con Supabase:', error.message);
    }
};

module.exports = {
    sequelize,
    testConnection
};
