const { sequelize } = require('../config/database');

// Importar modelos independientes primero
const Usuario = require('./Usuario');
const Socio = require('./Socio');
// Importar modelo dependiente al final
const RegistroAcceso = require('./RegistroAcceso');

// Definir relaciones
Usuario.hasMany(RegistroAcceso, { foreignKey: 'usuarioId', as: 'registros' });
RegistroAcceso.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Socio.hasMany(RegistroAcceso, { foreignKey: 'socioId', as: 'accesos' });
RegistroAcceso.belongsTo(Socio, { foreignKey: 'socioId', as: 'socio' });

// Sincronizar modelos con la base de datos
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con la base de datos');
    } catch (error) {
        console.error('❌ Error al sincronizar modelos:', error.message);
    }
};

module.exports = {
    sequelize,
    Usuario,
    Socio,
    RegistroAcceso,
    syncDatabase
};
