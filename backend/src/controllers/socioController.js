const { Socio, RegistroAcceso } = require('../models');

// Generar código QR simulado en formato string texto
const generarQR = (id) => {
    return `QR-${id.substring(0, 8)}-${Date.now()}`;
};

// Obtener todos los socios registrados
const getSocios = async (req, res) => {
    try {
        const socios = await Socio.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: socios
        });
    } catch (error) {
        console.error('Error al obtener socios:', error);
        res.status(500).json({
            message: 'Error al obtener la lista de socios',
            error: error.message
        });
    }
};

// Obtener socio específico por ID
const getSocioById = async (req, res) => {
    try {
        const { id } = req.params;
        const socio = await Socio.findByPk(id);

        if (!socio) {
            return res.status(404).json({
                message: 'Socio no encontrado'
            });
        }

        res.json({
            success: true,
            data: socio
        });
    } catch (error) {
        console.error('Error al obtener socio:', error);
        res.status(500).json({
            message: 'Error al obtener el socio',
            error: error.message
        });
    }
};

// Crear y registrar nuevo socio
const createSocio = async (req, res) => {
    try {
        const { nombre, email, telefono, fechaVencimiento } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !telefono || !fechaVencimiento) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios'
            });
        }

        // Verificar email duplicado
        const emailExists = await Socio.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Crear socio (dejando que el defaultValue de Sequelize genere el UUID automáticamente)
        const socio = await Socio.create({
            nombre,
            email,
            telefono,
            fechaVencimiento,
            activo: true,
            codigoQR: 'TEMPORAL' // Marcador provisional
        });

        // Generar un código QR único basado en el ID real que la DB le asignó
        const codigoQR = generarQR(socio.id);

        // Actualizar el registro con su QR definitivo
        await socio.update({ codigoQR });

        res.status(201).json({
            success: true,
            message: 'Socio registrado exitosamente',
            data: socio,
            qrCode: codigoQR
        });
    } catch (error) {
        console.error('Error al crear socio:', error);
        res.status(500).json({
            message: 'Error al registrar el socio',
            error: error.message
        });
    }
};

// Actualizar información del socio
const updateSocio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, fechaVencimiento, activo } = req.body;

        const socio = await Socio.findByPk(id);
        if (!socio) {
            return res.status(404).json({
                message: 'Socio no encontrado'
            });
        }

        // Verificar email duplicado (si se está cambiando)
        if (email && email !== socio.email) {
            const emailExists = await Socio.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({
                    message: 'El correo electrónico ya está registrado'
                });
            }
        }

        // Actualizar datos de forma segura
        await socio.update({
            nombre: nombre || socio.nombre,
            email: email || socio.email,
            telefono: telefono || socio.telefono,
            fechaVencimiento: fechaVencimiento || socio.fechaVencimiento,
            activo: activo !== undefined ? activo : socio.activo
        });

        res.json({
            success: true,
            message: 'Socio actualizado exitosamente',
            data: socio
        });
    } catch (error) {
        console.error('Error al actualizar socio:', error);
        res.status(500).json({
            message: 'Error al actualizar el socio',
            error: error.message
        });
    }
};

// Desactivar socio (Soft Delete)
const deleteSocio = async (req, res) => {
    try {
        const { id } = req.params;

        const socio = await Socio.findByPk(id);
        if (!socio) {
            return res.status(404).json({
                message: 'Socio no encontrado'
            });
        }

        // Cambiar el estado a inactivo
        await socio.update({ activo: false });

        res.json({
            success: true,
            message: 'Socio desactivado exitosamente'
        });
    } catch (error) {
        console.error('Error al desactivar socio:', error);
        res.status(500).json({
            message: 'Error al desactivar el socio',
            error: error.message
        });
    }
};

// Obtener historial completo de ingresos y salidas del socio
const getHistorialSocio = async (req, res) => {
    try {
        const { id } = req.params;

        const socio = await Socio.findByPk(id);
        if (!socio) {
            return res.status(404).json({
                message: 'Socio no encontrado'
            });
        }

        const historial = await RegistroAcceso.findAll({
            where: { socioId: id },
            order: [['fechaHora', 'DESC']],
            include: [
                {
                    model: Socio,
                    as: 'socio',
                    attributes: ['nombre', 'email']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                socio,
                historial
            }
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            message: 'Error al obtener el historial del socio',
            error: error.message
        });
    }
};

module.exports = {
    getSocios,
    getSocioById,
    createSocio,
    updateSocio,
    deleteSocio,
    getHistorialSocio
};
