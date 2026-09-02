const { Socio, RegistroAcceso } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Generar reporte de ocupación y analíticas del gimnasio
const generarReporte = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, tipo = 'diario' } = req.query;

        // Validar fechas
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                message: 'Por favor, proporcione fechas de inicio y fin'
            });
        }

        const startDate = new Date(fechaInicio);
        const endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999);

        // Obtener registros de acceso en el período
        const registros = await RegistroAcceso.findAll({
            where: {
                fechaHora: {
                    [Op.between]: [startDate, endDate]
                },
                estado: 'completado'
            },
            include: [
                {
                    model: Socio,
                    as: 'socio',
                    attributes: ['nombre', 'email']
                }
            ],
            order: [['fechaHora', 'ASC']]
        });

        if (registros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay datos disponibles para el período seleccionado'
            });
        }

        // Procesar datos para el reporte
        const entradas = registros.filter(r => r.tipo === 'entrada');
        const salidas = registros.filter(r => r.tipo === 'salida');

        // Calcular estadísticas generales
        const estadisticas = {
            totalRegistros: registros.length,
            totalEntradas: entradas.length,
            totalSalidas: salidas.length,
            sociosUnicos: [...new Set(registros.map(r => r.socioId))].length,
            fechaInicio: startDate,
            fechaFin: endDate
        };

        // Calcular horas pico (agrupar por hora)
        const horasPico = {};
        entradas.forEach(registro => {
            const hora = new Date(registro.fechaHora).getHours();
            horasPico[hora] = (horasPico[hora] || 0) + 1;
        });

        // Encontrar las 5 horas con más afluencia
        const horasOrdenadas = Object.entries(horasPico)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hora, count]) => ({
                hora: `${hora}:00 - ${hora + 1}:00`,
                ingresos: count
            }));

        // Calcular tiempo promedio de estancia
        let tiempoPromedio = 0;
        const sesiones = [];

        for (let i = 0; i < entradas.length; i++) {
            const entrada = entradas[i];
            const salida = salidas.find(s =>
                s.socioId === entrada.socioId &&
                s.fechaHora > entrada.fechaHora
            );

            if (salida) {
                const tiempo = (new Date(salida.fechaHora) - new Date(entrada.fechaHora)) / (1000 * 60); // minutos
                sesiones.push({
                    socio: entrada.socio?.nombre || 'Desconocido',
                    entrada: entrada.fechaHora,
                    salida: salida.fechaHora,
                    tiempo: Math.round(tiempo)
                });
            }
        }

        if (sesiones.length > 0) {
            const totalTiempo = sesiones.reduce((sum, s) => sum + s.tiempo, 0);
            tiempoPromedio = Math.round(totalTiempo / sesiones.length);
        }

        // Preparar respuesta final
        const reporte = {
            estadisticas,
            horasPico: horasOrdenadas,
            sesiones,
            tiempoPromedioEstancia: tiempoPromedio,
            tipo,
            totalRegistrosDiarios: agruparPorDia(registros)
        };

        res.json({
            success: true,
            data: reporte
        });

    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message
        });
    }
};

// Función auxiliar para agrupar marcas por día
const agruparPorDia = (registros) => {
    const agrupado = {};
    registros.forEach(registro => {
        const fecha = new Date(registro.fechaHora);
        const key = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!agrupado[key]) {
            agrupado[key] = 0;
        }
        agrupado[key]++;
    });
    return Object.entries(agrupado).map(([fecha, total]) => ({ fecha, total }));
};

// Exportar reporte completo directo a formato descargable CSV
const exportarCSV = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                message: 'Por favor, proporcione fechas de inicio y fin'
            });
        }

        const startDate = new Date(fechaInicio);
        const endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999);

        // Obtener registros
        const registros = await RegistroAcceso.findAll({
            where: {
                fechaHora: {
                    [Op.between]: [startDate, endDate]
                },
                estado: 'completado'
            },
            include: [
                {
                    model: Socio,
                    as: 'socio',
                    attributes: ['nombre', 'email', 'telefono']
                }
            ],
            order: [['fechaHora', 'ASC']]
        });

        if (registros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay datos disponibles para el período seleccionado'
            });
        }

        // Estructurar el texto en formato CSV plano plano
        let csv = 'Fecha,Hora,Tipo,Socio,Email,Telefono\n';
        registros.forEach(registro => {
            const fecha = new Date(registro.fechaHora);
            csv += `${fecha.toISOString().split('T')[0]},`;
            csv += `${fecha.toTimeString().split(' ')[0]},`;
            csv += `${registro.tipo},`;
            csv += `${registro.socio?.nombre || 'N/A'},`;
            csv += `${registro.socio?.email || 'N/A'},`;
            csv += `${registro.socio?.telefono || 'N/A'}\n`;
        });

        // Configurar los headers de descarga HTTP para el navegador web
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${fechaInicio}_${fechaFin}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('Error al exportar CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar el reporte',
            error: error.message
        });
    }
};

module.exports = {
    generarReporte,
    exportarCSV
};
