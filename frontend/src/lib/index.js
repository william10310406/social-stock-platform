/**
 * Stock Insight Platform - Component Library
 * 統一組件庫入口文件
 *
 * 使用方式：
 * import { Toast, Modal, Loading } from '../lib/index.js';
 * 或
 * import lib from '../lib/index.js';
 */

// 導入所有組件
import toast, { Toast } from './components/Toast.js';
import Modal from './components/Modal.js';
import loading, { Loading } from './components/Loading.js';

// 導入數據處理工具
import formatter, { Formatter } from './data/Formatter.js';

// 統一導出
export {
  // Toast 組件
  toast,
  Toast,

  // Modal 組件
  Modal,

  // Loading 組件
  loading,
  Loading,

  // Formatter 工具
  formatter,
  Formatter,
};

// 默認導出 - 包含所有組件的對象
export default {
  toast,
  Toast,
  Modal,
  loading,
  Loading,
  formatter,
  Formatter,
};

// 全局註冊（可選，向後兼容）
if (typeof window !== 'undefined') {
  // 註冊到全局，確保現有代碼能正常使用
  window.toast = toast;
  window.Toast = Toast;
  window.Modal = Modal;
  window.loading = loading;
  window.Loading = Loading;
  window.formatter = formatter;
  window.Formatter = Formatter;

  // 創建 lib 命名空間
  window.lib = {
    toast,
    Toast,
    Modal,
    loading,
    Loading,
    formatter,
    Formatter,
  };

  console.log('📚 Component Library loaded:', {
    components: ['Toast', 'Modal', 'Loading', 'Formatter'],
    global: 'window.lib',
    version: '1.0.0',
  });
}
