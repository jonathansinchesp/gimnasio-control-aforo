const { sequelize } = require('../config/database');
const { Socio } = require('../models');

// Función auxiliar para simular un hash de texto de 8 caracteres aleatorios para el QR inicial
const generarHashTemporal = () => Math.random().toString(36).substring(2, 10).toUpperCase();

const seedSocios = async () => {
    try {
        await sequelize.authenticate();
        console.log('📦 Conectado a la base de datos');

        const sociosData = [
            {
                nombre: 'Ana Martínez',
                email: 'ana@ejemplo.com',
                telefono: '0991234567',
                fechaVencimiento: new Date('2026-12-31')
            },
            {
                nombre: 'Carlos Gómez',
                email: 'carlos@ejemplo.com',
                telefono: '0997654321',
                fechaVencimiento: new Date('2026-11-30')
            },
            {
                nombre: 'María Rodríguez',
                email: 'maria@ejemplo.com',
                telefono: '0987654321',
                fechaVencimiento: new Date('2026-10-31')
            }
        ];

        for (const socioData of sociosData) {
            const exists = await Socio.findOne({
                where: { email: socioData.email }
            });

            if (!exists) {
                // Dejamos que el defaultValue de UUID del modelo Socio haga su trabajo automáticamente
                const nuevoSocio = await Socio.create({
                    ...socioData,
                    activo: true,
                    codigoQR: 'TEMPORAL'
                });

                // Asignamos un código QR limpio basado en los primeros 8 dígitos de su ID real asignado por la DB
                const qrFinal = `QR-${nuevoSocio.id.substring(0, 8)}-${generarHashTemporal()}`;
                await nuevoSocio.update({ codigoQR: qrFinal });

                console.log(`✅ Socio creado: ${socioData.nombre}`);
            } else {
                console.log(`ℹ️  Socio ya existe: ${socioData.email}`);
            }
        }

        console.log('🎉 Datos de socios insertados correctamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al seedear socios:', error);
        process.exit(1);
    }
};

seedSocios();
