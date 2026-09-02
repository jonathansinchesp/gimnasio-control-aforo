const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegistroAcceso = sequelize.define('RegistroAcceso', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    socioId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'socios', // <-- Cambiado a minúsculas para coincidir con tableName
            key: 'id'
        }
    },
    usuarioId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'usuarios', // <-- Cambiado a minúsculas para coincidir con tableName
            key: 'id'
        }
    },
    tipo: {
        type: DataTypes.ENUM('entrada', 'salida'),
        allowNull: false
    },
    fechaHora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.ENUM('completado', 'pendiente'),
        defaultValue: 'completado'
    }
}, {
    tableName: 'registros_acceso',
    timestamps: true
});

module.exports = RegistroAcceso;
