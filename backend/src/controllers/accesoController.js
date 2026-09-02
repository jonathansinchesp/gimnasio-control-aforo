const { Socio, RegistroAcceso } = require('../models');
const { sequelize } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

// Estado del aforo en memoria para tiempo real
let estadoAforo = {
    actual: 0,
    capacidadMaxima: 100,
    porcentaje: 0,
    alerta: 'normal'
};

const actualizarPorcentaje = () => {
    const { capacidadMaxima, actual } = estadoAforo;
    estadoAforo.porcentaje = capacidadMaxima > 0
        ? Math.round((actual / capacidadMaxima) * 100)
        : 0;

    if (estadoAforo.porcentaje >= 100) {
        estadoAforo.alerta = 'critical';
    } else if (estadoAforo.porcentaje >= 80) {
        estadoAforo.alerta = 'warning';
    } else {
        estadoAforo.alerta = 'normal';
    }
};

const configurarAforo = async (req, res) => {
    try {
        const { capacidadMaxima } = req.body;
        if (!capacidadMaxima || capacidadMaxima <= 0) {
            return res.status(400).json({ message: 'La capacidad máxima debe ser un número positivo' });
        }
        estadoAforo.capacidadMaxima = capacidadMaxima;
        actualizarPorcentaje();
        res.json({ success: true, data: { capacidadMaxima: estadoAforo.capacidadMaxima } });
    } catch (error) {
        res.status(500).json({ message: 'Error al configurar el aforo', error: error.message });
    }
};

const getEstadoAforo = async (req, res) => {
    try {
        res.json({
            success: true,
            actual: estadoAforo.actual,
            capacidadMaxima: estadoAforo.capacidadMaxima,
            porcentaje: estadoAforo.porcentaje,
            alerta: estadoAforo.alerta
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el estado del aforo', error: error.message });
    }
};

// Validar acceso por QR (Toggle de Entrada/Salida nativo sin dependencias de Op)
const validarAcceso = async (req, res) => {
    try {
        const { qrCode } = req.body;
        const usuarioId = req.userId;

        if (!qrCode) {
            return res.status(400).json({ message: 'Código QR no proporcionado' });
        }

        const socio = await Socio.findOne({ where: { codigoQR: qrCode, activo: true } });
        if (!socio) {
            return res.status(404).json({ success: false, message: 'QR inválido - Socio no encontrado', code: 'QR_INVALIDO' });
        }

        const fechaActual = new Date();
        if (new Date(socio.fechaVencimiento) < fechaActual) {
            return res.status(403).json({ success: false, message: 'Membresía expirada', code: 'MEMBRESIA_EXPIRADA' });
        }

        // Obtener el ÚLTIMO registro absoluto de este socio para saber si está dentro o fuera
        const ultimoRegistro = await RegistroAcceso.findOne({
            where: { socioId: socio.id },
            order: [['fechaHora', 'DESC']]
        });

        // REGLA DE TOGGLE: Si el último registro fue una ENTRADA, le toca salir obligatoriamente
        if (ultimoRegistro && ultimoRegistro.tipo === 'entrada') {
            const salida = await RegistroAcceso.create({
                socioId: socio.id,
                usuarioId: usuarioId,
                tipo: 'salida',
                fechaHora: new Date(),
                estado: 'completado'
            });

            estadoAforo.actual = Math.max(0, estadoAforo.actual - 1);
            actualizarPorcentaje();

            return res.json({
                success: true,
                message: 'Salida registrada - ¡Hasta pronto!',
                code: 'SALIDA_REGISTRADA',
                data: {
                    socio: { nombre: socio.nombre, email: socio.email },
                    salida,
                    aforo: estadoAforo
                }
            });
        }

        // REGLA DE ENTRADA: Si no tiene registros o el último fue una salida, entra
        if (estadoAforo.actual >= estadoAforo.capacidadMaxima) {
            return res.status(403).json({ success: false, message: 'Aforo completo - Intente más tarde', code: 'AFORO_COMPLETO' });
        }

        const entrada = await RegistroAcceso.create({
            socioId: socio.id,
            usuarioId: usuarioId,
            tipo: 'entrada',
            fechaHora: new Date(),
            estado: 'completado'
        });

        estadoAforo.actual += 1;
        actualizarPorcentaje();

        res.json({
            success: true,
            message: 'Acceso permitido - ¡Bienvenido!',
            code: 'ACCESO_PERMITIDO',
            data: {
                socio: { nombre: socio.nombre, email: socio.email },
                entrada,
                aforo: estadoAforo
            }
        });

    } catch (error) {
        console.error('Error al validar acceso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el acceso en el servidor',
            code: 'ERROR_SISTEMA',
            error: error.message
        });
    }
};

module.exports = {
    getEstadoAforo,
    configurarAforo,
    validarAcceso,
    estadoAforo
};
