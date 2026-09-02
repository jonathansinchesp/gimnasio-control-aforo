const express = require('express');
const router = express.Router();
const {
    getEstadoAforo,
    configurarAforo,
    validarAcceso
} = require('../controllers/accesoController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Ruta pública para consultar aforo (el Dashboard la usará constantemente)
router.get('/estado', getEstadoAforo);

// Rutas protegidas que requieren token obligatorio
router.use(verificarToken);

// Validar acceso por QR (accesible para recepcionistas y admins)
router.post('/validar', validarAcceso);

// Configurar aforo máximo (protegido solo para el rol admin)
router.put('/configurar', verificarRol(['admin']), configurarAforo);

module.exports = router;
