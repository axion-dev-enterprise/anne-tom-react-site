// Production-ready logger utility
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = isDevelopment ? this.levels.DEBUG : this.levels.ERROR;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      return `${formatted} | Data: ${JSON.stringify(data)}`;
    }
    
    return formatted;
  }

  error(message, data = null) {
    if (this.currentLevel >= this.levels.ERROR) {
      const formatted = this.formatMessage('ERROR', message, data);
      console.error(formatted);
      
      // In production, you might want to send errors to a monitoring service
      if (!isDevelopment) {
        this.sendToMonitoring('error', message, data);
      }
    }
  }

  warn(message, data = null) {
    if (this.currentLevel >= this.levels.WARN) {
      const formatted = this.formatMessage('WARN', message, data);
      console.warn(formatted);
    }
  }

  info(message, data = null) {
    if (this.currentLevel >= this.levels.INFO) {
      const formatted = this.formatMessage('INFO', message, data);
      console.log(formatted);
    }
  }

  debug(message, data = null) {
    if (this.currentLevel >= this.levels.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.log(formatted);
    }
  }

  sendToMonitoring(level, message, data) {
    // Placeholder for monitoring service integration
    // This could be Sentry, LogRocket, DataDog, etc.
    try {
      // Example: Send to monitoring service
      // monitoring.captureException(new Error(message), { extra: data });
    } catch (error) {
      console.error('Failed to send to monitoring service:', error);
    }
  }
}

const logger = new Logger();
export default logger;
