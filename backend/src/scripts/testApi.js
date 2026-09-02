const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';

const testAPI = async () => {
    console.log('🧪 Probando APIs del Sistema de Control de Aforo\n');

    try {
        // 1. Login
        console.log('1️⃣ Probando Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@gimnasio.com',
            password: 'Admin123'
        });
        token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        console.log(`👤 Usuario: ${loginResponse.data.user.nombre}\n`);

        // 2. Obtener estado del aforo
        console.log('2️⃣ Probando estado del aforo...');
        const aforoResponse = await axios.get(`${BASE_URL}/acceso/estado`);
        console.log('✅ Aforo consultado');
        console.log(`📊 Capacidad: ${aforoResponse.data.capacidadMaxima}, Actual: ${aforoResponse.data.actual}\n`);

        // 3. Crear un socio de prueba
        console.log('3️⃣ Probando creación de socio...');
        const socioResponse = await axios.post(
            `${BASE_URL}/socios`,
            {
                nombre: 'Juan Pérez',
                email: 'juan@ejemplo.com',
                telefono: '0987654321',
                fechaVencimiento: '2026-12-31'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Socio creado:', socioResponse.data.data.nombre);
        console.log(`📱 QR Generado: ${socioResponse.data.data.codigoQR}\n`);

        // 4. Validar acceso (entrada)
        console.log('4️⃣ Probando validación de acceso (entrada)...');
        const accesoResponse = await axios.post(
            `${BASE_URL}/acceso/validar`,
            { qrCode: socioResponse.data.data.codigoQR },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅', accesoResponse.data.message);
        console.log(`🔄 Nuevo aforo: ${accesoResponse.data.data.aforo.actual}\n`);

        // 5. Validar acceso (salida)
        console.log('5️⃣ Probando validación de acceso (salida)...');
        const salidaResponse = await axios.post(
            `${BASE_URL}/acceso/validar`,
            { qrCode: socioResponse.data.data.codigoQR },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅', salidaResponse.data.message);
        console.log(`🔄 Nuevo aforo: ${salidaResponse.data.data.aforo.actual}\n`);

        // 6. Generar reporte
        console.log('6️⃣ Probando generación de reporte...');
        const hoy = new Date();

        // Formatear año y mes con dos dígitos de forma segura
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');

        // Forzar rango extendido para evitar desfases de zona horaria (UTC vs Local)
        const fechaInicio = `${anio}-${mes}-01`;

        // Sumamos un día al mañana para asegurar que capture los registros de hoy sin importar el huso horario
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);
        const mesM = String(mañana.getMonth() + 1).padStart(2, '0');
        const diaM = String(mañana.getDate()).padStart(2, '0');
        const fechaFin = `${mañana.getFullYear()}-${mesM}-${diaM}`;

        const reporteResponse = await axios.get(
            `${BASE_URL}/reportes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Reporte generado');
        console.log(`📊 Total registros en el período: ${reporteResponse.data.data.estadisticas.totalRegistros}`);
        console.log(`⏱️  Tiempo promedio de estancia: ${reporteResponse.data.data.tiempoPromedioEstancia} minutos\n`);

        console.log('🎉 Todas las pruebas completadas exitosamente!');



    } catch (error) {
        console.error('❌ Error en las pruebas:');
        if (error.response) {
            console.error('  Respuesta:', error.response.data);
            console.error('  Status:', error.response.status);
        } else {
            console.error('  Error:', error.message);
        }
    }
};

testAPI();
