// logger.js - 統一日誌管理器
// 提供結構化、可控制的日誌輸出

class Logger {
  constructor() {
    this.isDevelopment =
      process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    this.logLevel = this.isDevelopment ? 'debug' : 'error';
    this.logHistory = [];
    this.maxHistorySize = 100;

    // 日誌級別
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
  }

  // 設置日誌級別
  setLevel(level) {
    if (Object.prototype.hasOwnProperty.call(this.levels, level)) {
      this.logLevel = level;
    }
  }

  // 檢查是否應該輸出日誌
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  // 格式化日誌消息
  formatMessage(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      category,
      message,
      data,
    };

    // 添加到歷史記錄
    this.logHistory.unshift(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(0, this.maxHistorySize);
    }

    return logEntry;
  }

  // Debug 級別日誌
  debug(category, message, data = null) {
    if (!this.shouldLog('debug')) return;

    const logEntry = this.formatMessage('debug', category, message, data);
    console.log(
      `%c[${logEntry.level}] %c${logEntry.category} %c${logEntry.message}`,
      'color: #888; font-weight: bold',
      'color: #0066cc; font-weight: bold',
      'color: #333',
      data || '',
    );
  }

  // Info 級別日誌
  info(category, message, data = null) {
    if (!this.shouldLog('info')) return;

    const logEntry = this.formatMessage('info', category, message, data);
    console.info(
      `%c[${logEntry.level}] %c${logEntry.category} %c${logEntry.message}`,
      'color: #0066cc; font-weight: bold',
      'color: #0066cc; font-weight: bold',
      'color: #333',
      data || '',
    );
  }

  // Warning 級別日誌
  warn(category, message, data = null) {
    if (!this.shouldLog('warn')) return;

    const logEntry = this.formatMessage('warn', category, message, data);
    console.warn(
      `%c[${logEntry.level}] %c${logEntry.category} %c${logEntry.message}`,
      'color: #ff9900; font-weight: bold',
      'color: #ff9900; font-weight: bold',
      'color: #333',
      data || '',
    );
  }

  // Error 級別日誌
  error(category, message, data = null) {
    if (!this.shouldLog('error')) return;

    const logEntry = this.formatMessage('error', category, message, data);
    console.error(
      `%c[${logEntry.level}] %c${logEntry.category} %c${logEntry.message}`,
      'color: #cc0000; font-weight: bold',
      'color: #cc0000; font-weight: bold',
      'color: #333',
      data || '',
    );
  }

  // API 請求日誌
  api(method, url, status, data = null) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this[level]('API', `${method} ${url} - ${status}`, data);
  }

  // WebSocket 日誌
  websocket(event, message, data = null) {
    this.debug('WebSocket', `${event}: ${message}`, data);
  }

  // 用戶操作日誌
  user(action, details = null) {
    this.info('User', action, details);
  }

  // 系統事件日誌
  system(event, details = null) {
    this.debug('System', event, details);
  }

  // 性能日誌
  performance(operation, duration, details = null) {
    const level = duration > 1000 ? 'warn' : 'debug';
    this[level]('Performance', `${operation} took ${duration}ms`, details);
  }

  // 獲取日誌歷史
  getHistory(limit = 50) {
    return this.logHistory.slice(0, limit);
  }

  // 清除日誌歷史
  clearHistory() {
    this.logHistory = [];
  }

  // 導出日誌
  exportLogs() {
    const logs = this.getHistory();
    const logText = logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level}] ${log.category}: ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`,
      )
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// 創建全域日誌實例
const logger = new Logger();

// 全域導出
window.logger = logger;

// ES6 模組導出
export default logger;
export { Logger };

// 簡化的全域函數
window.log = {
  debug: (category, message, data) => logger.debug(category, message, data),
  info: (category, message, data) => logger.info(category, message, data),
  warn: (category, message, data) => logger.warn(category, message, data),
  error: (category, message, data) => logger.error(category, message, data),
  api: (method, url, status, data) => logger.api(method, url, status, data),
  websocket: (event, message, data) => logger.websocket(event, message, data),
  user: (action, details) => logger.user(action, details),
  system: (event, details) => logger.system(event, details),
  performance: (operation, duration, details) => logger.performance(operation, duration, details),
};
