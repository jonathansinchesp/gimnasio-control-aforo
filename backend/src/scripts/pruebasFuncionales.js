const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

const ADMIN_CREDENTIALS = {
    email: 'admin@gimnasio.com',
    password: 'Admin123'
};

async function ejecutarPruebas() {
    console.log('\n--- EJECUTANDO PRUEBAS FUNCIONALES ---\n');
    let token = '';

    const ejecutar = async (id, desc, peticion) => {
        const inicio = Date.now();
        try {
            const response = await peticion();
            const duracion = Date.now() - inicio;
            console.log(`${id} | ${desc.padEnd(30)} | ✅ PASÓ  | ${duracion}ms`);
            return response.data;
        } catch (error) {
            const duracion = Date.now() - inicio;
            const status = error.response?.status || 'ERR';
            const msg = error.response?.data?.message || error.response?.data?.mensaje || error.response?.data?.error || '';
            console.log(`${id} | ${desc.padEnd(30)} | ❌ FALLÓ | ${duracion}ms (${status} ${msg})`);
            return null;
        }
    };

    // PF-01: Login
    const loginRes = await ejecutar('PF-01', 'Login de Administrador', () =>
        axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS)
    );

    token = loginRes?.token || loginRes?.data?.token || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // PF-02: Aforo
    await ejecutar('PF-02', 'Obtener estado del aforo', () =>
        axios.get(`${BASE_URL}/acceso/estado`, { headers })
    );

    // Consultar socio existente de respaldo en BD
    let socioExistente = null;
    try {
        const sociosRes = await axios.get(`${BASE_URL}/socios`, { headers });
        const lista = sociosRes.data?.data || sociosRes.data || [];
        if (lista.length > 0) {
            socioExistente = lista[0];
        }
    } catch (e) {}

    // PF-03: Registrar nuevo socio
    const nuevoSocio = {
        nombre: 'Socio de Prueba',
        email: `prueba_${Date.now()}@gimnasio.com`,
        telefono: '0999999999',
        fechaVencimiento: '2026-12-31'
    };

    const socioRes = await ejecutar('PF-03', 'Registrar nuevo socio', () =>
        axios.post(`${BASE_URL}/socios`, nuevoSocio, { headers })
    );

    // Extracción profunda del objeto de respuesta
    const socioCreado = socioRes?.data || socioRes;
    const socioIdReal = socioCreado?.id || socioExistente?.id;
    const qrCodeReal = socioRes?.qrCode || socioCreado?.codigoQR || socioCreado?.qrCode || socioExistente?.codigoQR;

    // PF-04: Entrada
    await ejecutar('PF-04', 'Validar acceso (entrada)', () =>
        axios.post(`${BASE_URL}/acceso/validar`, {
            codigoQR: qrCodeReal,
            qrCode: qrCodeReal,
            qr: qrCodeReal,
            codigo: qrCodeReal,
            tipo: 'entrada'
        }, { headers })
    );

    // PF-05: Salida
    await ejecutar('PF-05', 'Validar acceso (salida)', () =>
        axios.post(`${BASE_URL}/acceso/validar`, {
            codigoQR: qrCodeReal,
            qrCode: qrCodeReal,
            qr: qrCodeReal,
            codigo: qrCodeReal,
            tipo: 'salida'
        }, { headers })
    );

    // PF-06: Reportes
    await ejecutar('PF-06', 'Generar reporte', () =>
        axios.get(`${BASE_URL}/reportes`, {
            headers,
            params: { fechaInicio: '2026-01-01', fechaFin: '2026-12-31', tipo: 'diario' }
        })
    );

    // PF-07: Historial
    if (socioIdReal) {
        await ejecutar('PF-07', 'Obtener historial del socio', () =>
            axios.get(`${BASE_URL}/socios/${socioIdReal}/historial`, { headers })
        );
    } else {
        console.log('PF-07 | Obtener historial del socio | ❌ OMITIDO (Sin ID)');
    }

    console.log('\n--- PRUEBAS FINALIZADAS ---\n');
}

ejecutarPruebas();