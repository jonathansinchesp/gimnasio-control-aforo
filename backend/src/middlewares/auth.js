const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
    try {
        // Obtener token del header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'No autorizado. Token no proporcionado'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Sesión expirada. Por favor, inicie sesión nuevamente'
            });
        }

        res.status(500).json({
            message: 'Error al verificar autenticación',
            error: error.message
        });
    }
};

// Middleware para verificar roles
const verificarRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        try {
            const { Usuario } = require('../models');
            const usuario = await Usuario.findByPk(req.userId);

            if (!usuario) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }

            if (!rolesPermitidos.includes(usuario.rol)) {
                return res.status(403).json({
                    message: 'Permisos insuficientes. No tienes acceso a esta función'
                });
            }

            next();
        } catch (error) {
            console.error('Error al verificar rol:', error);
            res.status(500).json({
                message: 'Error al verificar permisos',
                error: error.message
            });
        }
    };
};

module.exports = {
    verificarToken,
    verificarRol
};
