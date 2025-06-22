/**
 * Formatter 數據格式化工具
 * 處理日期、貨幣、數字等格式化需求
 */

class Formatter {
  constructor() {
    this.locale = 'zh-TW';
    this.currency = 'TWD';
    this.timezone = 'Asia/Taipei';
  }

  /**
   * 格式化貨幣
   * @param {number} amount - 金額
   * @param {string} currency - 貨幣代碼
   * @param {Object} options - 選項
   */
  currency(amount, currency = this.currency, options = {}) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '-';
    }

    const { minimumFractionDigits = 2, maximumFractionDigits = 2, showSymbol = true } = options;

    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits,
        maximumFractionDigits,
      });

      return formatter.format(amount);
    } catch (error) {
      console.warn('Currency formatting error:', error);
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  /**
   * 格式化數字
   * @param {number} number - 數字
   * @param {Object} options - 選項
   */
  number(number, options = {}) {
    if (number === null || number === undefined || isNaN(number)) {
      return '-';
    }

    const { minimumFractionDigits = 0, maximumFractionDigits = 2, useGrouping = true } = options;

    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping,
      });

      return formatter.format(number);
    } catch (error) {
      console.warn('Number formatting error:', error);
      return number.toString();
    }
  }

  /**
   * 格式化百分比
   * @param {number} value - 數值 (如 0.05 表示 5%)
   * @param {Object} options - 選項
   */
  percentage(value, options = {}) {
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    const { minimumFractionDigits = 2, maximumFractionDigits = 2, showSign = false } = options;

    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        style: 'percent',
        minimumFractionDigits,
        maximumFractionDigits,
        signDisplay: showSign ? 'always' : 'auto',
      });

      return formatter.format(value);
    } catch (error) {
      console.warn('Percentage formatting error:', error);
      return `${(value * 100).toFixed(2)}%`;
    }
  }

  /**
   * 格式化日期
   * @param {Date|string} date - 日期
   * @param {string} format - 格式 (short, medium, long, full, custom)
   * @param {Object} options - 選項
   */
  date(date, format = 'medium', options = {}) {
    if (!date) return '-';

    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '-';
    }

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const { timeZone = this.timezone } = options;

    try {
      if (format === 'custom' && options.pattern) {
        return this.formatDateWithPattern(dateObj, options.pattern);
      }

      const formatOptions = {
        timeZone,
        ...this.getDateFormatOptions(format),
      };

      return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return dateObj.toLocaleDateString(this.locale);
    }
  }

  /**
   * 格式化時間
   * @param {Date|string} date - 日期時間
   * @param {string} format - 格式
   */
  time(date, format = 'short') {
    if (!date) return '-';

    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '-';
    }

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    try {
      const formatOptions = {
        timeZone: this.timezone,
        ...this.getTimeFormatOptions(format),
      };

      return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
    } catch (error) {
      console.warn('Time formatting error:', error);
      return dateObj.toLocaleTimeString(this.locale);
    }
  }

  /**
   * 格式化相對時間 (如 "2 小時前")
   * @param {Date|string} date - 日期
   */
  relativeTime(date) {
    if (!date) return '-';

    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '-';
    }

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffMs = now - dateObj;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return '剛剛';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} 分鐘前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小時前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return this.date(dateObj, 'short');
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 位元組數
   * @param {number} decimals - 小數點位數
   */
  fileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return '-';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * 格式化股票價格變化
   * @param {number} change - 變化量
   * @param {Object} options - 選項
   */
  stockChange(change, options = {}) {
    if (change === null || change === undefined || isNaN(change)) {
      return { value: '-', color: 'gray', symbol: '' };
    }

    const { showSign = true, decimals = 2 } = options;

    const isPositive = change > 0;
    const isNegative = change < 0;
    const isZero = change === 0;

    let color = 'gray';
    let symbol = '';

    if (isPositive) {
      color = 'red'; // 台股紅漲
      symbol = showSign ? '+' : '';
    } else if (isNegative) {
      color = 'green'; // 台股綠跌
      symbol = '';
    }

    const value = `${symbol}${this.number(change, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

    return { value, color, symbol, isPositive, isNegative, isZero };
  }

  /**
   * 格式化成交量
   * @param {number} volume - 成交量
   */
  volume(volume) {
    if (!volume || isNaN(volume)) return '-';

    if (volume >= 100000000) {
      return this.number(volume / 100000000, { maximumFractionDigits: 2 }) + '億';
    } else if (volume >= 10000) {
      return this.number(volume / 10000, { maximumFractionDigits: 1 }) + '萬';
    } else {
      return this.number(volume, { maximumFractionDigits: 0 });
    }
  }

  /**
   * 縮短數字格式 (如 1.2K, 3.4M)
   * @param {number} number - 數字
   * @param {number} decimals - 小數位數
   */
  shortNumber(number, decimals = 1) {
    if (!number || isNaN(number)) return '-';

    const units = ['', 'K', 'M', 'B', 'T'];
    const tier = (Math.log10(Math.abs(number)) / 3) | 0;

    if (tier === 0) return number.toString();

    const suffix = units[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = number / scale;

    return scaled.toFixed(decimals) + suffix;
  }

  // 私有方法

  getDateFormatOptions(format) {
    switch (format) {
      case 'short':
        return { year: 'numeric', month: '2-digit', day: '2-digit' };
      case 'medium':
        return { year: 'numeric', month: 'short', day: 'numeric' };
      case 'long':
        return { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
      case 'full':
        return {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        };
      default:
        return { year: 'numeric', month: 'short', day: 'numeric' };
    }
  }

  getTimeFormatOptions(format) {
    switch (format) {
      case 'short':
        return { hour: '2-digit', minute: '2-digit' };
      case 'medium':
        return { hour: '2-digit', minute: '2-digit', second: '2-digit' };
      case 'long':
        return {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        };
      default:
        return { hour: '2-digit', minute: '2-digit' };
    }
  }

  formatDateWithPattern(date, pattern) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return pattern
      .replace(/YYYY/g, year)
      .replace(/MM/g, month.toString().padStart(2, '0'))
      .replace(/DD/g, day.toString().padStart(2, '0'))
      .replace(/HH/g, hour.toString().padStart(2, '0'))
      .replace(/mm/g, minute.toString().padStart(2, '0'))
      .replace(/ss/g, second.toString().padStart(2, '0'));
  }
}

// 創建全局實例
const formatter = new Formatter();

// 全局暴露
window.formatter = formatter;
window.Formatter = Formatter;

// ES6 模組導出
export default formatter;
export { Formatter };
