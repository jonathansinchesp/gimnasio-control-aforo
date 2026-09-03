const { Socio, RegistroAcceso } = require('../models');
const { sequelize } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

let capacidadMaximaBase = 100;

// Helper optimizado: Ejecuta 1 sola consulta agrupada en lugar de N+1 consultas
const obtenerAforoEnTiempoReal = async () => {
    try {
        // Traemos el último registro de cada socio con una Subconsulta limpia
        const [resultados] = await sequelize.query(`
            SELECT COUNT(*) as dentro 
            FROM (
                SELECT DISTINCT ON ("socioId") "tipo"
                FROM "RegistroAccesos"
                ORDER BY "socioId", "fechaHora" DESC
            ) ultimo_estado
            WHERE tipo = 'entrada';
        `);

        const actualesDentro = parseInt(resultados[0]?.dentro || 0, 10);

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
    } catch (error) {
        // Alternativa Sequelize si SQL directo difiere en nombre de tabla
        const ultimos = await RegistroAcceso.findAll({
            attributes: ['socioId', 'tipo', 'fechaHora'],
            order: [['fechaHora', 'DESC']],
            raw: true
        });

        const dentroMap = new Map();
        for (const reg of ultimos) {
            if (!dentroMap.has(reg.socioId)) {
                dentroMap.set(reg.socioId, reg.tipo);
            }
        }

        let actualesDentro = 0;
        dentroMap.forEach(tipo => {
            if (tipo === 'entrada') actualesDentro++;
        });

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
    }
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

        const ultimoRegistro = await RegistroAcceso.findOne({
            where: { socioId: socio.id },
            order: [['fechaHora', 'DESC']]
        });

        const aforoPrevio = await obtenerAforoEnTiempoReal();

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