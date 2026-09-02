const express = require('express');
const router = express.Router();
const {
    generarReporte,
    exportarCSV
} = require('../controllers/reporteController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas requieren autenticación obligatoria
router.use(verificarToken);

// Solo los usuarios con rol de administrador pueden generar reportes
router.use(verificarRol(['admin']));

// Endpoints expuestos
router.get('/', generarReporte);
router.get('/csv', exportarCSV);

module.exports = router;
