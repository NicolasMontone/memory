import { appendFileSync } from 'fs';
import { join } from 'path';
const LOG_FILE = join(import.meta.dirname, 'mcp-server.log');
function formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
}
// 4. logger
export const logger = {
    log(message, data) {
        const logMessage = formatMessage('INFO', message, data);
        appendFileSync(LOG_FILE, logMessage);
    },
    error(message, data) {
        const logMessage = formatMessage('ERROR', message, data);
        appendFileSync(LOG_FILE, logMessage);
    },
    warn(message, data) {
        const logMessage = formatMessage('WARN', message, data);
        appendFileSync(LOG_FILE, logMessage);
    },
    debug(message, data) {
        const logMessage = formatMessage('DEBUG', message, data);
        appendFileSync(LOG_FILE, logMessage);
    },
};
