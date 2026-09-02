const fs = require('fs');
const path = require('path');

// Definir y asegurar la existencia del directorio de logs en la raíz del backend
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = (req, res, next) => {
    const start = Date.now();
    const { method, url, ip } = req;

    // Escuchar cuando la respuesta de la petición HTTP ha finalizado
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const logMessage = `${new Date().toISOString()} | ${method} | ${url} | ${statusCode} | ${duration}ms | ${ip}\n`;

        // Registrar log en la terminal de consola
        console.log(logMessage.trim());

        // Adjuntar log de forma asíncrona/secuencial en el archivo local de texto
        fs.appendFileSync(
            path.join(logDir, 'access.log'),
            logMessage
        );
    });

    next();
};

module.exports = logger;
