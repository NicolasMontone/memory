import { appendFileSync } from 'fs'
import { join } from 'path'

const LOG_FILE = join(import.meta.dirname, 'mcp-server.log')

function formatMessage(level: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString()
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : ''
  return `[${timestamp}] [${level}] ${message}${dataStr}\n`
}

// 4. logger
export const logger = {
  log(message: string, data?: unknown) {
    const logMessage = formatMessage('INFO', message, data)
    appendFileSync(LOG_FILE, logMessage)
  },
  error(message: string, data?: unknown) {
    const logMessage = formatMessage('ERROR', message, data)
    appendFileSync(LOG_FILE, logMessage)
  },
  warn(message: string, data?: unknown) {
    const logMessage = formatMessage('WARN', message, data)
    appendFileSync(LOG_FILE, logMessage)
  },
  debug(message: string, data?: unknown) {
    const logMessage = formatMessage('DEBUG', message, data)
    appendFileSync(LOG_FILE, logMessage)
  },
}
