const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Socio = sequelize.define('Socio', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    fechaVencimiento: {
        type: DataTypes.DATE,
        allowNull: false
    },
    codigoQR: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'socios',
    timestamps: true
});

module.exports = Socio;
