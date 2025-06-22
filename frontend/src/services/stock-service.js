/**
 * 股票業務服務
 * 
 * 封裝所有與股票相關的業務邏輯
 * 基於你現有的 126支真實台股 和 2030+筆價格資料
 */

import { Toast, Loading } from '../lib/index.js';

/**
 * 股票服務類
 */
export class StockService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分鐘緩存
    this.watchList = new Set();
  }

  /**
   * 獲取股票列表
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>} 股票列表
   */
  async getStocks(params = {}) {
    const cacheKey = `stocks:${JSON.stringify(params)}`;
    
    // 檢查緩存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      Loading.show('載入股票列表...');
      
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/stocks${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 更新緩存
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      Toast.show('載入股票列表失敗', 'error');
      throw error;
    } finally {
      Loading.hide();
    }
  }

  /**
   * 獲取單支股票詳細資料
   * @param {string} stockId - 股票ID
   * @returns {Promise<Object>} 股票詳細資料
   */
  async getStock(stockId) {
    const cacheKey = `stock:${stockId}`;
    
    // 檢查緩存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      Loading.show('載入股票資料...');
      
      const response = await fetch(`/api/stocks/${stockId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('股票不存在');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 更新緩存
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch stock:', error);
      Toast.show(error.message || '載入股票資料失敗', 'error');
      throw error;
    } finally {
      Loading.hide();
    }
  }

  /**
   * 獲取股票價格歷史
   * @param {string} stockId - 股票ID
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>} 價格歷史資料
   */
  async getStockPrices(stockId, params = {}) {
    try {
      Loading.show('載入價格歷史...');
      
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/stocks/${stockId}/prices${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch stock prices:', error);
      Toast.show('載入價格歷史失敗', 'error');
      throw error;
    } finally {
      Loading.hide();
    }
  }

  /**
   * 搜尋股票
   * @param {string} query - 搜尋關鍵字
   * @returns {Promise<Array>} 搜尋結果
   */
  async searchStocks(query) {
    if (!query || query.trim().length < 1) {
      return [];
    }

    try {
      const params = {
        search: query.trim(),
        limit: 20,
      };
      
      const result = await this.getStocks(params);
      return result.stocks || [];
    } catch (error) {
      console.error('Search stocks failed:', error);
      return [];
    }
  }

  /**
   * 加入關注清單
   * @param {string} stockId - 股票ID
   * @returns {Promise<boolean>} 是否成功
   */
  async addToWatchList(stockId) {
    try {
      if (this.watchList.has(stockId)) {
        Toast.show('股票已在關注清單中', 'warning');
        return false;
      }

      // 這裡可以調用 API 將關注資料保存到後端
      // 目前先用本地狀態模擬
      this.watchList.add(stockId);
      
      Toast.show('已加入關注清單', 'success');
      
      // 觸發自定義事件
      document.dispatchEvent(new CustomEvent('stockWatchAdded', {
        detail: { stockId },
      }));
      
      return true;
    } catch (error) {
      console.error('Add to watch list failed:', error);
      Toast.show('加入關注清單失敗', 'error');
      return false;
    }
  }

  /**
   * 從關注清單移除
   * @param {string} stockId - 股票ID
   * @returns {Promise<boolean>} 是否成功
   */
  async removeFromWatchList(stockId) {
    try {
      if (!this.watchList.has(stockId)) {
        Toast.show('股票不在關注清單中', 'warning');
        return false;
      }

      this.watchList.delete(stockId);
      
      Toast.show('已從關注清單移除', 'success');
      
      // 觸發自定義事件
      document.dispatchEvent(new CustomEvent('stockWatchRemoved', {
        detail: { stockId },
      }));
      
      return true;
    } catch (error) {
      console.error('Remove from watch list failed:', error);
      Toast.show('移除關注清單失敗', 'error');
      return false;
    }
  }

  /**
   * 獲取關注清單
   * @returns {Promise<Array>} 關注的股票列表
   */
  async getWatchList() {
    try {
      const watchedStockIds = Array.from(this.watchList);
      if (watchedStockIds.length === 0) {
        return [];
      }

      // 並行獲取所有關注股票的詳細資料
      const promises = watchedStockIds.map(stockId => 
        this.getStock(stockId).catch(error => {
          console.error(`Failed to fetch watched stock ${stockId}:`, error);
          return null;
        }),
      );

      const results = await Promise.all(promises);
      return results.filter(stock => stock !== null);
    } catch (error) {
      console.error('Get watch list failed:', error);
      return [];
    }
  }

  /**
   * 檢查股票是否在關注清單中
   * @param {string} stockId - 股票ID
   * @returns {boolean} 是否在關注清單中
   */
  isWatched(stockId) {
    return this.watchList.has(stockId);
  }

  /**
   * 計算股票統計資料
   * @param {Array} prices - 價格歷史
   * @returns {Object} 統計資料
   */
  calculateStatistics(prices) {
    if (!prices || prices.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        volatility: 0,
        trend: 'neutral',
      };
    }

    const closePrices = prices.map(p => p.close);
    const min = Math.min(...closePrices);
    const max = Math.max(...closePrices);
    const average = closePrices.reduce((sum, price) => sum + price, 0) / closePrices.length;

    // 計算波動率 (標準差)
    const variance = closePrices.reduce((sum, price) => 
      sum + Math.pow(price - average, 2), 0) / closePrices.length;
    const volatility = Math.sqrt(variance);

    // 判斷趨勢
    const firstPrice = closePrices[0];
    const lastPrice = closePrices[closePrices.length - 1];
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    let trend = 'neutral';
    if (change > 1) trend = 'bullish';
    else if (change < -1) trend = 'bearish';

    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      average: Number(average.toFixed(2)),
      volatility: Number(volatility.toFixed(2)),
      trend,
      change: Number(change.toFixed(2)),
    };
  }

  /**
   * 清除緩存
   */
  clearCache() {
    this.cache.clear();
    console.log('Stock service cache cleared');
  }

  /**
   * 獲取緩存統計
   * @returns {Object} 緩存統計資料
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 導出單例實例
export const stockService = new StockService(); 