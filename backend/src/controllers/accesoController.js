const { Socio, RegistroAcceso } = require('../models');
const { sequelize } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

// Configuración base de la capacidad
let capacidadMaximaBase = 100;

// Helper para calcular el aforo real desde las tablas permanentes de la base de datos
const obtenerAforoEnTiempoReal = async () => {
    // 1. Obtener el último registro absoluto de cada socio para saber quién sigue dentro
    // Agrupamos por socioId y filtramos los que tengan tipo 'entrada' como último estado
    const ultimosRegistros = await RegistroAcceso.findAll({
        attributes: [
            'socioId',
            [sequelize.fn('MAX', sequelize.col('fechaHora')), 'maxFecha']
        ],
        group: ['socioId'],
        raw: true
    });

    let actualesDentro = 0;

    // 2. Verificar el tipo de cada uno de esos últimos registros
    for (const reg of ultimosRegistros) {
        const detalle = await RegistroAcceso.findOne({
            where: {
                socioId: reg.socioId,
                fechaHora: reg.maxFecha
            },
            raw: true
        });

        if (detalle && detalle.tipo === 'entrada') {
            actualesDentro++;
        }
    }

    // 3. Estructurar el objeto de respuesta con los porcentajes matemáticos precisos
    const porcentaje = capacidadMaximaBase > 0
        ? Math.round((actualesDentro / capacidadMaximaBase) * 100)
        : 0;

    let alerta = 'normal';
    if (porcentaje >= 100) alerta = 'critical';
    else if (porcentaje >= 80) alerta = 'warning';

    return {
        actual: actualesDentro,
        capacidadMaxima: capacidadMaximaBase,
        porcentaje,
        alerta
    };
};

const configurarAforo = async (req, res) => {
    try {
        const { capacidadMaxima } = req.body;
        if (!capacidadMaxima || capacidadMaxima <= 0) {
            return res.status(400).json({ message: 'La capacidad máxima debe ser un número positivo' });
        }
        capacidadMaximaBase = capacidadMaxima;
        const aforo = await obtenerAforoEnTiempoReal();
        res.json({ success: true, data: { capacidadMaxima: aforo.capacidadMaxima } });
    } catch (error) {
        res.status(500).json({ message: 'Error al configurar el aforo', error: error.message });
    }
};

const getEstadoAforo = async (req, res) => {
    try {
        // En lugar de leer una variable de memoria volátil, calcula los datos reales de Supabase
        const aforo = await obtenerAforoEnTiempoReal();
        res.json({
            success: true,
            actual: aforo.actual,
            capacidadMaxima: aforo.capacidadMaxima,
            porcentaje: aforo.porcentaje,
            alerta: aforo.alerta
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

        const aforoPrevio = await obtenerAforoEnTiempoReal();

        // REGLA DE TOGGLE: Si el último registro fue una ENTRADA, le toca salir obligatoriamente
        if (ultimoRegistro && ultimoRegistro.tipo === 'entrada') {
            const salida = await RegistroAcceso.create({
                socioId: socio.id,
                usuarioId: usuarioId,
                tipo: 'salida',
                fechaHora: new Date(),
                estado: 'completado'
            });

            const aforoActualizado = await obtenerAforoEnTiempoReal();

            return res.json({
                success: true,
                message: 'Salida registrada - ¡Hasta pronto!',
                code: 'SALIDA_REGISTRADA',
                data: {
                    socio: { nombre: socio.nombre, email: socio.email },
                    salida,
                    aforo: aforoActualizado
                }
            });
        }

        // REGLA DE ENTRADA: Si no tiene registros o el último fue una salida, entra
        if (aforoPrevio.actual >= aforoPrevio.capacidadMaxima) {
            return res.status(403).json({ success: false, message: 'Aforo completo - Intente más tarde', code: 'AFORO_COMPLETO' });
        }

        const entrada = await RegistroAcceso.create({
            socioId: socio.id,
            usuarioId: usuarioId,
            tipo: 'entrada',
            fechaHora: new Date(),
            estado: 'completado'
        });

        const aforoFinal = await obtenerAforoEnTiempoReal();

        res.json({
            success: true,
            message: 'Acceso permitido - ¡Bienvenido!',
            code: 'ACCESO_PERMITIDO',
            data: {
                socio: { nombre: socio.nombre, email: socio.email },
                entrada,
                aforo: aforoFinal
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
    validarAcceso
};
