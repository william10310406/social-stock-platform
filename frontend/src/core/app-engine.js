/**
 * 應用程式引擎
 * 
 * 負責整個應用的初始化、生命週期管理和核心功能協調
 * 基於你現有的企業級架構和 97.4% 測試覆蓋率標準
 */

import { Toast, Loading } from '../lib/index.js';
import { stockService } from '../services/index.js';

/**
 * 應用程式引擎類
 */
export class AppEngine {
  constructor() {
    this.version = '2.1.0';
    this.environment = 'development';
    this.isInitialized = false;
    this.isReady = false;
    this.startTime = null;
    this.components = new Map();
    this.services = new Map();
    this.plugins = new Map();
    this.eventListeners = new Map();
  }

  /**
   * 初始化應用程式
   * @param {Object} config - 應用配置
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize(config = {}) {
    try {
      this.startTime = Date.now();
      console.log(`🚀 Initializing Stock Insight Platform v${this.version}...`);
      
      // 1. 驗證和設置配置
      await this.setupConfig(config);
      
      // 2. 初始化核心服務
      await this.initializeServices();
      
      // 3. 註冊核心組件
      await this.registerComponents();
      
      // 4. 設置事件監聽器
      await this.setupEventListeners();
      
      // 5. 執行健康檢查
      await this.performHealthCheck();
      
      this.isInitialized = true;
      
      // 觸發初始化完成事件
      this.emitEvent('app:init', {
        version: this.version,
        environment: this.environment,
        config: this.getPublicConfig(),
        timestamp: new Date().toISOString(),
      });
      
      console.log(`✅ Application initialized successfully in ${Date.now() - this.startTime}ms`);
      return true;
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.emitEvent('app:error', {
        error: {
          message: error.message,
          code: 'INIT_FAILED',
          stack: error.stack,
        },
        context: { phase: 'initialization' },
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  /**
   * 啟動應用程式
   * @returns {Promise<boolean>} 啟動是否成功
   */
  async start() {
    if (!this.isInitialized) {
      throw new Error('Application must be initialized before starting');
    }

    try {
      console.log('🎯 Starting application components...');
      
      // 啟動所有註冊的組件
      const componentPromises = Array.from(this.components.values()).map(component => {
        if (component.start && typeof component.start === 'function') {
          return component.start().catch(error => {
            console.error(`Failed to start component ${component.name}:`, error);
            return false;
          });
        }
        return Promise.resolve(true);
      });
      
      const results = await Promise.all(componentPromises);
      const failedComponents = results.filter(result => result === false).length;
      
      if (failedComponents > 0) {
        console.warn(`⚠️ ${failedComponents} components failed to start`);
      }
      
      this.isReady = true;
      const loadTime = Date.now() - this.startTime;
      
      // 觸發應用就緒事件
      this.emitEvent('app:ready', {
        loadTime,
        components: Array.from(this.components.keys()),
        timestamp: new Date().toISOString(),
      });
      
      console.log(`🎉 Application ready in ${loadTime}ms`);
      Toast.show(`應用程式已就緒 (${loadTime}ms)`, 'success');
      
      return true;
      
    } catch (error) {
      console.error('❌ Application start failed:', error);
      this.emitEvent('app:error', {
        error: {
          message: error.message,
          code: 'START_FAILED',
          stack: error.stack,
        },
        context: { phase: 'startup' },
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  /**
   * 停止應用程式
   * @returns {Promise<boolean>} 停止是否成功
   */
  async stop() {
    try {
      console.log('🛑 Stopping application...');
      
      // 停止所有組件
      const componentPromises = Array.from(this.components.values()).map(component => {
        if (component.stop && typeof component.stop === 'function') {
          return component.stop().catch(error => {
            console.error(`Failed to stop component ${component.name}:`, error);
            return false;
          });
        }
        return Promise.resolve(true);
      });
      
      await Promise.all(componentPromises);
      
      // 清理事件監聽器
      this.cleanupEventListeners();
      
      this.isReady = false;
      this.isInitialized = false;
      
      console.log('✅ Application stopped successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Application stop failed:', error);
      return false;
    }
  }

  /**
   * 設置配置
   * @param {Object} config - 配置對象
   */
  async setupConfig(config) {
    this.config = {
      // 默認配置
      app: {
        name: 'Stock Insight Platform',
        version: this.version,
        environment: this.environment,
        debug: false,
      },
      api: {
        baseUrl: window.location.origin,
        timeout: 10000,
        retries: 3,
      },
      ui: {
        theme: 'light',
        pageSize: 20,
        language: 'zh-TW',
      },
      // 合併用戶配置
      ...config,
    };
    
    this.environment = this.config.app.environment || 'development';
    console.log(`📋 Configuration loaded for ${this.environment} environment`);
  }

  /**
   * 初始化核心服務
   */
  async initializeServices() {
    console.log('⚙️ Initializing core services...');
    
    // 註冊股票服務
    this.services.set('stockService', stockService);
    
    // 可以在這裡註冊更多服務
    // this.services.set('userService', userService);
    // this.services.set('realtimeService', realtimeService);
    
    console.log(`✅ ${this.services.size} services initialized`);
  }

  /**
   * 註冊核心組件
   */
  async registerComponents() {
    console.log('🧩 Registering core components...');
    
    // 註冊 Toast 組件
    this.components.set('toast', {
      name: 'Toast',
      instance: Toast,
      start: () => Promise.resolve(true),
      stop: () => Promise.resolve(true),
    });
    
    // 註冊 Loading 組件
    this.components.set('loading', {
      name: 'Loading',
      instance: Loading,
      start: () => Promise.resolve(true),
      stop: () => Promise.resolve(true),
    });
    
    console.log(`✅ ${this.components.size} components registered`);
  }

  /**
   * 設置事件監聽器
   */
  async setupEventListeners() {
    console.log('👂 Setting up event listeners...');
    
    // 監聽未捕獲的錯誤
    const errorHandler = (event) => {
      this.handleUnhandledError(event.error);
    };
    
    const rejectionHandler = (event) => {
      this.handleUnhandledRejection(event.reason);
    };
    
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    this.eventListeners.set('error', errorHandler);
    this.eventListeners.set('unhandledrejection', rejectionHandler);
    
    console.log('✅ Event listeners configured');
  }

  /**
   * 執行健康檢查
   */
  async performHealthCheck() {
    console.log('🏥 Performing health check...');
    
    const checks = [];
    
    // 檢查核心服務
    checks.push(this.checkServices());
    
    // 檢查組件狀態
    checks.push(this.checkComponents());
    
    const results = await Promise.all(checks);
    const allHealthy = results.every(result => result === true);
    
    if (!allHealthy) {
      console.warn('⚠️ Some health checks failed');
    } else {
      console.log('✅ All health checks passed');
    }
    
    return allHealthy;
  }

  /**
   * 檢查服務狀態
   */
  async checkServices() {
    try {
      // 檢查股票服務是否正常
      const stockServiceCheck = this.services.has('stockService');
      return stockServiceCheck;
    } catch (error) {
      console.error('Service health check failed:', error);
      return false;
    }
  }

  /**
   * 檢查組件狀態
   */
  async checkComponents() {
    try {
      // 檢查核心組件是否可用
      return this.components.size > 0;
    } catch (error) {
      console.error('Component health check failed:', error);
      return false;
    }
  }

  /**
   * 處理未捕獲的錯誤
   * @param {Error} error - 錯誤對象
   */
  handleUnhandledError(error) {
    console.error('Unhandled error:', error);
    this.emitEvent('app:error', {
      error: {
        message: error.message,
        code: 'UNHANDLED_ERROR',
        stack: error.stack,
      },
      context: { type: 'unhandled' },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 處理未捕獲的 Promise 拒絕
   * @param {any} reason - 拒絕原因
   */
  handleUnhandledRejection(reason) {
    console.error('Unhandled promise rejection:', reason);
    this.emitEvent('app:error', {
      error: {
        message: reason?.message || String(reason),
        code: 'UNHANDLED_REJECTION',
        stack: reason?.stack,
      },
      context: { type: 'promise_rejection' },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 發送事件
   * @param {string} type - 事件類型
   * @param {Object} payload - 事件負載
   */
  emitEvent(type, payload) {
    const event = new CustomEvent(type, { detail: payload });
    document.dispatchEvent(event);
  }

  /**
   * 清理事件監聽器
   */
  cleanupEventListeners() {
    this.eventListeners.forEach((handler, event) => {
      window.removeEventListener(event, handler);
    });
    this.eventListeners.clear();
  }

  /**
   * 獲取公開配置（隱藏敏感資料）
   * @returns {Object} 公開配置
   */
  getPublicConfig() {
    const { app, ui } = this.config;
    return { app, ui };
  }

  /**
   * 獲取應用狀態
   * @returns {Object} 應用狀態
   */
  getStatus() {
    return {
      version: this.version,
      environment: this.environment,
      isInitialized: this.isInitialized,
      isReady: this.isReady,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      components: Array.from(this.components.keys()),
      services: Array.from(this.services.keys()),
    };
  }
}

// 導出單例實例
export const appEngine = new AppEngine(); 