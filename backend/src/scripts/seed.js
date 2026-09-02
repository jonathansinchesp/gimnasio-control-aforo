const { sequelize } = require('../config/database');
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('📦 Conectado a la base de datos');

        const salt = await bcrypt.genSalt(10);

        // Crear administrador
        const adminExists = await Usuario.findOne({
            where: { email: 'admin@gimnasio.com' }
        });

        if (!adminExists) {
            const hashedPasswordAdmin = await bcrypt.hash('Admin123', salt);
            await Usuario.create({
                nombre: 'Administrador',
                email: 'admin@gimnasio.com',
                password: hashedPasswordAdmin,
                rol: 'admin',
                activo: true
            });
            console.log('✅ Administrador creado');
        } else {
            console.log('ℹ️ El administrador ya existe en la base de datos');
        }

        // Crear recepcionista
        const recepExists = await Usuario.findOne({
            where: { email: 'recepcionista@gimnasio.com' }
        });

        if (!recepExists) {
            const hashedPasswordRecep = await bcrypt.hash('Recep123', salt);
            await Usuario.create({
                nombre: 'Recepcionista',
                email: 'recepcionista@gimnasio.com',
                password: hashedPasswordRecep,
                rol: 'recepcionista',
                activo: true
            });
            console.log('✅ Recepcionista creado');
        } else {
            console.log('ℹ️ El recepcionista ya existe en la base de datos');
        }

        console.log('🎉 Datos de prueba insertados correctamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al seedear la base de datos:', error);
        process.exit(1);
    }
};

seedDatabase();
