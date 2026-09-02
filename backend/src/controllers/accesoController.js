const { Socio, RegistroAcceso } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize'); // Corrección: Importación explícita de los operadores de Sequelize
const dotenv = require('dotenv');

dotenv.config();

// Estado del aforo (en memoria para tiempo real)
let estadoAforo = {
    actual: 0,
    capacidadMaxima: 100, // Valor por defecto
    porcentaje: 0,
    alerta: 'normal' // 'normal', 'warning', 'critical'
};

// Actualizar porcentaje y alertas
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

// Configurar capacidad máxima
const configurarAforo = async (req, res) => {
    try {
        const { capacidadMaxima } = req.body;

        if (!capacidadMaxima || capacidadMaxima <= 0) {
            return res.status(400).json({
                message: 'La capacidad máxima debe ser un número positivo'
            });
        }

        estadoAforo.capacidadMaxima = capacidadMaxima;
        actualizarPorcentaje();

        res.json({
            success: true,
            message: 'Capacidad máxima actualizada exitosamente',
            data: {
                capacidadMaxima: estadoAforo.capacidadMaxima
            }
        });
    } catch (error) {
        console.error('Error al configurar aforo:', error);
        res.status(500).json({
            message: 'Error al configurar la capacidad máxima',
            error: error.message
        });
    }
};

// Obtener estado del aforo
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
        console.error('Error al obtener estado de aforo:', error);
        res.status(500).json({
            message: 'Error al obtener el estado del aforo',
            error: error.message
        });
    }
};

// Validar acceso por QR
const validarAcceso = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { qrCode } = req.body;
        const usuarioId = req.userId;

        if (!qrCode) {
            return res.status(400).json({
                message: 'Código QR no proporcionado'
            });
        }

        // Buscar socio por código QR
        const socio = await Socio.findOne({
            where: { codigoQR: qrCode, activo: true }
        });

        if (!socio) {
            return res.status(404).json({
                success: false,
                message: 'QR inválido - Socio no encontrado',
                code: 'QR_INVALIDO'
            });
        }

        // Verificar membresía vigente
        const fechaActual = new Date();
        const fechaVencimiento = new Date(socio.fechaVencimiento);

        if (fechaVencimiento < fechaActual) {
            return res.status(403).json({
                success: false,
                message: 'Membresía expirada - Por favor, renueve su membresía',
                code: 'MEMBRESIA_EXPIRADA'
            });
        }

        // Verificar si el socio ya tiene una entrada activa
        const accesoActivo = await RegistroAcceso.findOne({
            where: {
                socioId: socio.id,
                tipo: 'entrada',
                estado: 'completado'
            },
            order: [['fechaHora', 'DESC']]
        });

        if (accesoActivo) {
            // Verificar si tiene salida registrada posterior a la entrada encontrada
            const salidaRegistrada = await RegistroAcceso.findOne({
                where: {
                    socioId: socio.id,
                    tipo: 'salida',
                    estado: 'completado',
                    fechaHora: {
                        [Op.gt]: accesoActivo.fechaHora // Corrección de sintaxis Op.gt
                    }
                }
            });

            if (!salidaRegistrada) {
                // Registrar salida automática (Toggle)
                const salida = await RegistroAcceso.create({
                    socioId: socio.id,
                    usuarioId: usuarioId,
                    tipo: 'salida',
                    fechaHora: new Date(),
                    estado: 'completado'
                }, { transaction });

                estadoAforo.actual = Math.max(0, estadoAforo.actual - 1);
                actualizarPorcentaje();

                await transaction.commit();

                return res.json({
                    success: true,
                    message: 'Salida registrada - Hasta pronto',
                    code: 'SALIDA_REGISTRADA',
                    data: {
                        socio: {
                            nombre: socio.nombre,
                            email: socio.email
                        },
                        salida,
                        aforo: estadoAforo
                    }
                });
            }
        }

        // Si va a entrar, verificar aforo máximo primero
        if (estadoAforo.actual >= estadoAforo.capacidadMaxima) {
            return res.status(403).json({
                success: false,
                message: 'Aforo completo - Intente más tarde',
                code: 'AFORO_COMPLETO',
                data: {
                    aforo: estadoAforo
                }
            });
        }

        // Registrar entrada
        const entrada = await RegistroAcceso.create({
            socioId: socio.id,
            usuarioId: usuarioId,
            tipo: 'entrada',
            fechaHora: new Date(),
            estado: 'completado'
        }, { transaction });

        estadoAforo.actual += 1;
        actualizarPorcentaje();

        let alertaMensaje = null;
        if (estadoAforo.porcentaje >= 100) {
            alertaMensaje = '⚠️ AFORO COMPLETO - Capacidad máxima alcanzada';
        } else if (estadoAforo.porcentaje >= 80) {
            alertaMensaje = '⚠️ Aforo elevado - 80% de capacidad';
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Acceso permitido - Bienvenido',
            code: 'ACCESO_PERMITIDO',
            data: {
                socio: {
                    nombre: socio.nombre,
                    email: socio.email
                },
                entrada,
                aforo: estadoAforo,
                alerta: alertaMensaje
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al validar acceso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar el acceso',
            code: 'ERROR_SISTEMA',
            error: error.message
        });
    }
};

// Función para recargar el aforo desde la base de datos (Sincronización inicial)
const recargarAforo = async () => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Conteo opcional de auditoría
        const entradas = await RegistroAcceso.count({
            where: {
                tipo: 'entrada',
                estado: 'completado',
                fechaHora: {
                    [Op.gte]: hoy // Corrección de sintaxis Op.gte
                }
            }
        });

        console.log(`📊 Aforo inicializado: ${estadoAforo.actual} personas en el gimnasio`);
    } catch (error) {
        console.error('Error al recargar aforo:', error);
    }
};

// Inicializar aforo de inmediato
recargarAforo();

module.exports = {
    getEstadoAforo,
    configurarAforo,
    validarAcceso,
    estadoAforo
};
