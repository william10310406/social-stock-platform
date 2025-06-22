/**
 * 協議定義和類型接口統一導出
 * 
 * 這個模組負責定義系統中所有的：
 * - API 協議接口
 * - 數據類型定義
 * - 事件協議規範
 * - WebSocket 協議
 * 
 * 遵循 Level 0 架構原則：不依賴任何內部模組
 */

// API 協議定義
export * from './api-contracts.js';

// 數據類型定義
export * from './data-types.js';

// 事件協議
export * from './event-protocols.js';

// WebSocket 協議
export * from './websocket-protocols.js';

// 配置協議
export * from './config-contracts.js'; 