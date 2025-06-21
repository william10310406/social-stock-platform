/**
 * 簡單的模板系統
 * 用於將公共組件注入到頁面中
 */

// 導入路徑配置
import { ROUTES } from './config/routes.js';

class TemplateEngine {
  constructor() {
    this.components = new Map();
  }

  /**
   * 載入組件
   */
  async loadComponent(name, path) {
    try {
      const response = await fetch(path);
      const html = await response.text();
      this.components.set(name, html);
      return html;
    } catch (error) {
      console.error(`Failed to load component ${name}:`, error);
      return '';
    }
  }

  /**
   * 渲染模板
   */
  render(template, data = {}) {
    let rendered = template;

    // 替換變量
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, data[key] || '');
    });

    // 替換組件
    this.components.forEach((html, name) => {
      const regex = new RegExp(`{{${name}}}`, 'g');
      rendered = rendered.replace(regex, html);
    });

    return rendered;
  }

  /**
   * 初始化頁面
   */
  async initPage(pageConfig) {
    // 載入導航欄
    await this.loadComponent('navbar', ROUTES.components.navbar);

    // 更新頁面標題
    if (pageConfig.title) {
      document.title = `${pageConfig.title} - Stock Insight Platform`;
    }

    // 注入導航欄
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
      navbarContainer.innerHTML = this.components.get('navbar') || '';
    }
  }
}

// 全局實例
window.templateEngine = new TemplateEngine();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  // 從 meta 標籤獲取頁面配置
  const titleMeta = document.querySelector('meta[name="page-title"]');
  const config = {
    title: titleMeta ? titleMeta.content : '首頁',
  };

  window.templateEngine.initPage(config);
});
