import { useState, useCallback } from 'react';
import { reporteService } from '../services/reporteService';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useReportes = () => {
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener fechas predeterminadas
    const getDefaultDates = useCallback(() => {
        const hoy = new Date();
        const inicio = startOfMonth(hoy);
        const fin = endOfMonth(hoy);
        return {
            fechaInicio: format(inicio, 'yyyy-MM-dd'),
            fechaFin: format(fin, 'yyyy-MM-dd')
        };
    }, []);

    // Generar reporte
    const generarReporte = useCallback(async (fechaInicio, fechaFin, tipo = 'diario') => {
        setLoading(true);
        setError(null);

        try {
            const response = await reporteService.generar(fechaInicio, fechaFin, tipo);
            setReporte(response.data.data);
            toast.success('Reporte generado exitosamente');
            return response.data.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Error al generar el reporte';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Exportar a CSV
    const exportarCSV = useCallback(async (fechaInicio, fechaFin) => {
        try {
            setLoading(true);
            const response = await reporteService.exportarCSV(fechaInicio, fechaFin);

            // Crear URL para descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${fechaInicio}_${fechaFin}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Reporte CSV exportado exitosamente');
        } catch (err) {
            const message = err.response?.data?.message || 'Error al exportar CSV';
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Exportar a PDF
    const exportarPDF = useCallback((data, fechaInicio, fechaFin) => {
        try {
            if (!data) {
                toast.error('No hay datos válidos para exportar a PDF');
                return;
            }

            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();

            // Título
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE OCUPACIÓN - GIMNASIO', pageWidth / 2, 20, { align: 'center' });

            // Fechas del Período
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            let fechaInicioFormateada = fechaInicio;
            let fechaFinFormateada = fechaFin;
            try {
                fechaInicioFormateada = format(parseISO(fechaInicio), 'dd/MM/yyyy', { locale: es });
                fechaFinFormateada = format(parseISO(fechaFin), 'dd/MM/yyyy', { locale: es });
            } catch (e) {
                console.warn('Error al formatear fechas del encabezado:', e);
            }
            doc.text(`Período: ${fechaInicioFormateada} al ${fechaFinFormateada}`, pageWidth / 2, 30, { align: 'center' });

            // Estadísticas principales
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Estadísticas Generales', 14, 45);

            doc.setFont('helvetica', 'normal');
            const stats = data.estadisticas || {};
            const yStart = 55;
            const lineHeight = 8;

            doc.text(`Total de registros: ${stats.totalRegistros ?? 0}`, 20, yStart);
            doc.text(`Total de entradas: ${stats.totalEntradas ?? 0}`, 20, yStart + lineHeight);
            doc.text(`Total de salidas: ${stats.totalSalidas ?? 0}`, 20, yStart + lineHeight * 2);
            doc.text(`Socios únicos: ${stats.sociosUnicos ?? 0}`, 20, yStart + lineHeight * 3);
            doc.text(`Tiempo promedio de estancia: ${data.tiempoPromedioEstancia ?? 0} minutos`, 20, yStart + lineHeight * 4);

            // Horas pico
            let currentY = yStart + lineHeight * 6;
            if (data.horasPico && data.horasPico.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text('Horas de Mayor Afluencia', 14, currentY);
                doc.setFont('helvetica', 'normal');

                data.horasPico.forEach((hora) => {
                    currentY += lineHeight;
                    doc.text(`${hora.hora || 'N/A'}: ${hora.ingresos ?? 0} ingresos`, 20, currentY);
                });
                currentY += lineHeight * 2;
            } else {
                currentY += lineHeight * 2;
            }

            // Tabla de sesiones utilizando la función autoTable importada directamente
            if (data.sesiones && data.sesiones.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text('Detalle de Sesiones', 14, currentY);

                const tableData = data.sesiones.map(sesion => {
                    let entradaStr = 'N/A';
                    let salidaStr = 'N/A';

                    try {
                        if (sesion.entrada) {
                            entradaStr = format(parseISO(sesion.entrada), 'dd/MM/yyyy HH:mm', { locale: es });
                        }
                    } catch (e) {
                        entradaStr = String(sesion.entrada || 'N/A');
                    }

                    try {
                        if (sesion.salida) {
                            salidaStr = format(parseISO(sesion.salida), 'dd/MM/yyyy HH:mm', { locale: es });
                        }
                    } catch (e) {
                        salidaStr = String(sesion.salida || 'N/A');
                    }

                    return [
                        sesion.socio || 'N/A',
                        entradaStr,
                        salidaStr,
                        `${sesion.tiempo ?? 0} min`
                    ];
                });

                autoTable(doc, {
                    startY: currentY + 4,
                    head: [['Socio', 'Entrada', 'Salida', 'Duración']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: '#2980b9', textColor: '#ffffff' },
                    styles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 35 },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 25 }
                    }
                });
            }

            // Pie de página
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');

                let hoyStr = '';
                try {
                    hoyStr = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
                } catch (e) {
                    hoyStr = new Date().toLocaleString();
                }

                doc.text(
                    `Generado el ${hoyStr} - Página ${i} de ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Guardar PDF
            doc.save(`reporte_ocupacion_${fechaInicio}_${fechaFin}.pdf`);
            toast.success('Reporte PDF generado exitosamente');

        } catch (error) {
            console.error('Error crítico al generar PDF:', error);
            toast.error('Error interno al compilar el documento PDF');
        }
    }, []);

    return {
        reporte,
        loading,
        error,
        generarReporte,
        exportarCSV,
        exportarPDF,
        getDefaultDates
    };
};
