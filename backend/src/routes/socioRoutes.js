const express = require('express');
const router = express.Router();
const {
    getSocios,
    getSocioById,
    createSocio,
    updateSocio,
    deleteSocio,
    getHistorialSocio
} = require('../controllers/socioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas públicas para recepcionistas y admins
router.get('/', getSocios);
router.get('/:id', getSocioById);
router.get('/:id/historial', getHistorialSocio);

// Rutas solo para administradores
router.post('/', verificarRol(['admin']), createSocio);
router.put('/:id', verificarRol(['admin']), updateSocio);
router.delete('/:id', verificarRol(['admin']), deleteSocio);

module.exports = router;
