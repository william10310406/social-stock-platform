/**
 * 核心系統功能統一導出
 * 
 * 這個模組負責：
 * - 系統核心功能
 * - 架構基礎設施
 * - 框架級別抽象
 * - 底層工具和引擎
 * 
 * 遵循 Level 0-1 架構原則：可依賴 proto, lib, services
 */

// 應用程式引擎
export * from './app-engine.js';

// 事件系統
export * from './event-system.js';

// 配置管理器
export * from './config-manager.js';

// 路由引擎
export * from './router-engine.js';

// 狀態管理
export * from './state-manager.js';

// 插件系統
export * from './plugin-system.js'; 