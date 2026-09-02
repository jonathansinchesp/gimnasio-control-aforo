const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
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
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('admin', 'recepcionista'),
        allowNull: false,
        defaultValue: 'recepcionista'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimoAcceso: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.password) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    }
});

// Método para verificar contraseña
Usuario.prototype.validarPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;
