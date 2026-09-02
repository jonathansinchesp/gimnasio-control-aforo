const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Importación explícita para la comparación directa
const dotenv = require('dotenv');

dotenv.config();

// Generar token JWT
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Controlador para login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que se enviaron email y password
        if (!email || !password) {
            return res.status(400).json({
                message: 'Por favor, ingrese email y contraseña'
            });
        }

        // Buscar usuario por email
        const usuario = await Usuario.findOne({
            where: { email }
        });

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(401).json({
                message: 'Usuario desactivado. Contacte al administrador'
            });
        }

        // COMPARACIÓN DIRECTA CON BCRYPT (Solución definitiva sin depender del prototipo del modelo)
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar último acceso
        await usuario.update({ ultimoAcceso: new Date() });

        // Generar token
        const token = generarToken(usuario.id);

        // Enviar respuesta (sin incluir la contraseña)
        const usuarioResponse = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        res.json({
            success: true,
            token,
            user: usuarioResponse,
            message: 'Inicio de sesión exitoso'
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

// Controlador para obtener el perfil del usuario autenticado
const getPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: usuario
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            message: 'Error al obtener el perfil',
            error: error.message
        });
    }
};

// Controlador para cerrar sesión (logout)
const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al cerrar sesión',
            error: error.message
        });
    }
};

module.exports = {
    login,
    getPerfil,
    logout
};
