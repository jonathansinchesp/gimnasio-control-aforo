const express = require('express');
const router = express.Router();
const { login, getPerfil, logout } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { Usuario } = require('../models'); // Importar el modelo directamente para la inyección
const bcrypt = require('bcryptjs');

// RUTA DE EMERGENCIA PARA CREAR AL ADMINISTRADOR Y RECEPCIONISTA LOCAL
router.get('/register-admin', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);

        // 1. Limpiar y Registrar Administrador (Clave: Admin123)
        await Usuario.destroy({ where: { email: 'admin@gimnasio.com' } });
        const hashedPasswordAdmin = await bcrypt.hash('Admin123', salt);
        await Usuario.create({
            nombre: 'Administrador',
            email: 'admin@gimnasio.com',
            password: hashedPasswordAdmin,
            rol: 'admin',
            activo: true
        });

        // 2. Limpiar y Registrar Recepcionista (Clave: Recep123)
        await Usuario.destroy({ where: { email: 'recepcionista@gimnasio.com' } });
        const hashedPasswordRecep = await bcrypt.hash('Recep123', salt);
        await Usuario.create({
            nombre: 'Recepcionista',
            email: 'recepcionista@gimnasio.com',
            password: hashedPasswordRecep,
            rol: 'recepcionista',
            activo: true
        });

        res.json({
            success: true,
            message: '¡Usuarios Administrador y Recepcionista creados con éxito localmente en Supabase!'
        });
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
