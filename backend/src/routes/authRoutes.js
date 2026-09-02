const express = require('express');
const router = express.Router();
const { login, getPerfil, logout } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { Usuario } = require('../models'); // Importamos el modelo directamente aquí
const bcrypt = require('bcryptjs');

// RUTA DE EMERGENCIA PARA CREAR AL ADMINISTRADOR LOCAL
router.get('/register-admin', async (req, res) => {
    try {
        // Eliminar si ya existe para evitar llaves duplicadas
        await Usuario.destroy({ where: { email: 'admin@gimnasio.com' } });

        // Encriptar localmente con tu versión exacta de bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin123', salt);

        // Crear el usuario administrador
        const nuevoAdmin = await Usuario.create({
            nombre: 'Administrador',
            email: 'admin@gimnasio.com',
            password: hashedPassword,
            rol: 'admin',
            activo: true
        });

        res.json({ success: true, message: '¡Usuario Administrador creado con éxito localmente!', nuevoAdmin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rutas públicas
router.post('/login', login);
router.post('/logout', logout);

// Rutas protegidas
router.get('/perfil', verificarToken, getPerfil);

module.exports = router;
