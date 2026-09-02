const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Iniciando pruebas de rendimiento y estrés...\n');

// Asegurar la existencia del directorio de resultados en la raíz del backend
const resultadosDir = path.join(__dirname, '../../resultados');
if (!fs.existsSync(resultadosDir)) {
    fs.mkdirSync(resultadosDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = path.join(resultadosDir, `load-test-${timestamp}.json`);

// Ejecutar Artillery apuntando al archivo de configuración y guardando el JSON
const command = `npx artillery run ${path.join(__dirname, 'loadTest.yml')} --output ${outputFile}`;

console.log(`📊 Comando a ejecutar: ${command}\n`);

const child = exec(command);

child.stdout.on('data', (data) => {
    console.log(data);
});

child.stderr.on('data', (data) => {
    console.error(data);
});

child.on('close', (code) => {
    console.log(`\n🏁 Pruebas finalizadas con código de salida: ${code}`);
    console.log(`📁 Historial completo guardado en: ${outputFile}`);

    // Generar resumen analítico si el proceso terminó con éxito
    if (code === 0) {
        try {
            const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

            // Validar existencia de los contadores aggregate antes de leerlos
            const aggregate = results.aggregate || {};
            const counters = aggregate.counters || {};
            const summary = aggregate.summary || {};
            const responseTime = summary['http.response_time'] || summary['http.latency'] || {};

            console.log('\n📊 Resumen de Rendimiento del Servidor:');
            console.log(`  Total de peticiones: ${counters['http.requests'] || 0}`);
            console.log(`  Respuestas exitosas (200 OK): ${counters['http.codes.200'] || 0}`);
            console.log(`  Respuestas erróneas (500 Error): ${counters['http.codes.500'] || 0}`);
            console.log(`  Tiempo promedio de respuesta (Mediana): ${responseTime.median || 'N/A'} ms`);
            console.log(`  Tiempo máximo registrado (P95): ${responseTime.p95 || 'N/A'} ms`);
        } catch (error) {
            console.log('  ⚠️ Los datos se guardaron, pero no se pudo compilar el resumen rápido en consola.');
            console.error(error.message);
        }
    }
});
