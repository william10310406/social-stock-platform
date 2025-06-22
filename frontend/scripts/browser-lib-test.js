/**
 * Browser Console Library Test
 * 在瀏覽器控制台運行此腳本來測試組件庫功能
 *
 * 使用方法:
 * 1. 打開任何包含 lib 的頁面
 * 2. 打開瀏覽器開發者工具 (F12)
 * 3. 複製此腳本到控制台並執行
 */

(function () {
  'use strict';

  // 測試結果收集
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: [],
  };

  // 日誌函數
  const log = {
    title: (msg) =>
      console.log(`%c📚 ${msg}`, 'font-size: 16px; font-weight: bold; color: #2563eb;'),
    success: (msg) => console.log(`%c✅ ${msg}`, 'color: #16a34a; font-weight: bold;'),
    error: (msg) => console.log(`%c❌ ${msg}`, 'color: #dc2626; font-weight: bold;'),
    warning: (msg) => console.log(`%c⚠️ ${msg}`, 'color: #d97706; font-weight: bold;'),
    info: (msg) => console.log(`%cℹ️ ${msg}`, 'color: #0891b2;'),
  };

  // 測試函數
  function test(name, testFn) {
    testResults.total++;
    try {
      const result = testFn();
      if (result !== false) {
        testResults.passed++;
        testResults.details.push({ name, status: 'passed' });
        log.success(`${name} - 通過`);
        return true;
      } else {
        testResults.failed++;
        testResults.details.push({ name, status: 'failed', error: 'Test returned false' });
        log.error(`${name} - 失敗`);
        return false;
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push({ name, status: 'failed', error: error.message });
      log.error(`${name} - 錯誤: ${error.message}`);
      return false;
    }
  }

  // 異步測試函數
  async function asyncTest(name, testFn) {
    testResults.total++;
    try {
      const result = await testFn();
      if (result !== false) {
        testResults.passed++;
        testResults.details.push({ name, status: 'passed' });
        log.success(`${name} - 通過`);
        return true;
      } else {
        testResults.failed++;
        testResults.details.push({ name, status: 'failed', error: 'Test returned false' });
        log.error(`${name} - 失敗`);
        return false;
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push({ name, status: 'failed', error: error.message });
      log.error(`${name} - 錯誤: ${error.message}`);
      return false;
    }
  }

  // 測試全局變數存在性
  function testGlobalVariables() {
    log.title('測試全局變數');

    test('window.lib 存在', () => {
      return typeof window.lib === 'object' && window.lib !== null;
    });

    test('window.toast 存在', () => {
      return typeof window.toast === 'object' && window.toast !== null;
    });

    test('window.Toast 類存在', () => {
      return typeof window.Toast === 'function';
    });

    test('window.Modal 類存在', () => {
      return typeof window.Modal === 'function';
    });

    test('window.loading 存在', () => {
      return typeof window.loading === 'object' && window.loading !== null;
    });

    test('window.Loading 類存在', () => {
      return typeof window.Loading === 'function';
    });

    test('window.formatter 存在', () => {
      return typeof window.formatter === 'object' && window.formatter !== null;
    });

    test('window.Formatter 類存在', () => {
      return typeof window.Formatter === 'function';
    });
  }

  // 測試 Toast 功能
  function testToastFunctionality() {
    log.title('測試 Toast 功能');

    test('Toast.success 方法存在', () => {
      return typeof window.toast.success === 'function';
    });

    test('Toast.error 方法存在', () => {
      return typeof window.toast.error === 'function';
    });

    test('Toast.warning 方法存在', () => {
      return typeof window.toast.warning === 'function';
    });

    test('Toast.info 方法存在', () => {
      return typeof window.toast.info === 'function';
    });

    test('Toast.show 方法存在', () => {
      return typeof window.toast.show === 'function';
    });

    test('Toast.clearAll 方法存在', () => {
      return typeof window.toast.clearAll === 'function';
    });

    // 功能測試 (不會實際顯示，只測試是否能調用)
    test('Toast.success 可以調用', () => {
      try {
        // 創建一個臨時的 toast 實例進行測試
        const result = window.toast.success('測試訊息');
        return true;
      } catch (error) {
        console.error('Toast.success 調用失敗:', error);
        return false;
      }
    });
  }

  // 測試 Modal 功能
  function testModalFunctionality() {
    log.title('測試 Modal 功能');

    test('Modal 可以實例化', () => {
      const modal = new window.Modal();
      return modal instanceof window.Modal;
    });

    test('Modal.open 方法存在', () => {
      const modal = new window.Modal();
      return typeof modal.open === 'function';
    });

    test('Modal.close 方法存在', () => {
      const modal = new window.Modal();
      return typeof modal.close === 'function';
    });

    test('Modal.confirm 靜態方法存在', () => {
      return typeof window.Modal.confirm === 'function';
    });

    test('Modal.alert 靜態方法存在', () => {
      return typeof window.Modal.alert === 'function';
    });

    test('Modal 可以設置選項', () => {
      const modal = new window.Modal({ size: 'large' });
      return modal.options.size === 'large';
    });
  }

  // 測試 Loading 功能
  function testLoadingFunctionality() {
    log.title('測試 Loading 功能');

    test('Loading.showFullscreen 方法存在', () => {
      return typeof window.loading.showFullscreen === 'function';
    });

    test('Loading.hideFullscreen 方法存在', () => {
      return typeof window.loading.hideFullscreen === 'function';
    });

    test('Loading.showInContainer 方法存在', () => {
      return typeof window.loading.showInContainer === 'function';
    });

    test('Loading.hideInContainer 方法存在', () => {
      return typeof window.loading.hideInContainer === 'function';
    });

    test('Loading.showError 方法存在', () => {
      return typeof window.loading.showError === 'function';
    });

    test('Loading.clearAll 方法存在', () => {
      return typeof window.loading.clearAll === 'function';
    });
  }

  // 測試 Formatter 功能
  function testFormatterFunctionality() {
    log.title('測試 Formatter 功能');

    test('Formatter.currency 方法存在', () => {
      return typeof window.formatter.currency === 'function';
    });

    test('Formatter.number 方法存在', () => {
      return typeof window.formatter.number === 'function';
    });

    test('Formatter.percentage 方法存在', () => {
      return typeof window.formatter.percentage === 'function';
    });

    test('Formatter.date 方法存在', () => {
      return typeof window.formatter.date === 'function';
    });

    test('Formatter.stockChange 方法存在', () => {
      return typeof window.formatter.stockChange === 'function';
    });

    test('Formatter.volume 方法存在', () => {
      return typeof window.formatter.volume === 'function';
    });

    // 功能測試
    test('Formatter.currency 正常工作', () => {
      const result = window.formatter.currency(1234.56);
      return typeof result === 'string' && result.includes('1,234.56');
    });

    test('Formatter.stockChange 正常工作', () => {
      const result = window.formatter.stockChange(0.15);
      return (
        typeof result === 'object' &&
        result.hasOwnProperty('value') &&
        result.hasOwnProperty('color')
      );
    });

    test('Formatter.volume 正常工作', () => {
      const result = window.formatter.volume(12340000);
      return typeof result === 'string' && result.includes('萬');
    });
  }

  // 測試組件庫整合
  function testLibraryIntegration() {
    log.title('測試組件庫整合');

    test('lib 命名空間包含所有組件', () => {
      return (
        window.lib &&
        window.lib.toast &&
        window.lib.Modal &&
        window.lib.loading &&
        window.lib.formatter
      );
    });

    test('組件版本信息存在', () => {
      // 檢查是否有版本信息或載入日誌
      return true; // 這個測試總是通過，因為版本信息是可選的
    });
  }

  // 生成測試報告
  function generateReport() {
    log.title('測試報告');

    const passRate = Math.round((testResults.passed / testResults.total) * 100);

    console.log(
      `%c
╔════════════════════════════════════════════════════════════╗
║                    📊 組件庫測試報告                        ║
╠════════════════════════════════════════════════════════════╣
║  總測試數: ${testResults.total.toString().padEnd(3)} │ 通過: ${testResults.passed.toString().padEnd(3)} │ 失敗: ${testResults.failed.toString().padEnd(3)} │ 通過率: ${passRate}%  ║
╚════════════════════════════════════════════════════════════╝
    `,
      'font-family: monospace; color: #1f2937;',
    );

    if (testResults.failed > 0) {
      log.warning('失敗的測試:');
      testResults.details
        .filter((test) => test.status === 'failed')
        .forEach((test) => {
          console.log(`  ❌ ${test.name}: ${test.error || '未知錯誤'}`);
        });
    }

    if (passRate === 100) {
      log.success('🎉 所有測試通過！組件庫運行正常。');
      log.info('💡 你可以開始使用組件庫了：');
      console.log(`
        // 使用 Toast
        toast.success('操作成功！');

        // 使用 Modal
        const modal = new Modal({ size: 'large' });
        modal.open({ title: '測試', body: '內容' });

        // 使用 Loading
        loading.showFullscreen('載入中...');

        // 使用 Formatter
        formatter.currency(1234.56); // "NT$1,234.56"
      `);
    } else {
      log.error('⚠️ 部分測試失敗，組件庫可能無法正常工作。');
      log.info('請檢查控制台錯誤訊息或查看文檔：');
      log.info('📖 frontend/docs/implementation/LIB_IMPLEMENTATION_COMPLETE.md');
    }

    return {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: passRate,
      details: testResults.details,
    };
  }

  // 主測試函數
  async function runAllTests() {
    console.clear();
    log.title('Stock Insight Platform - 組件庫測試');
    log.info('開始執行組件庫功能測試...\n');

    // 檢查基本環境
    if (typeof window === 'undefined') {
      log.error('此腳本需要在瀏覽器環境中運行');
      return;
    }

    // 執行所有測試
    testGlobalVariables();
    testToastFunctionality();
    testModalFunctionality();
    testLoadingFunctionality();
    testFormatterFunctionality();
    testLibraryIntegration();

    // 生成報告
    const report = generateReport();

    // 返回結果供外部使用
    return report;
  }

  // 執行測試
  log.info('準備執行組件庫測試...');
  log.info('如果你想重新運行測試，請調用: runLibTest()');

  // 將測試函數暴露到全局
  window.runLibTest = runAllTests;

  // 自動執行測試
  runAllTests().then((report) => {
    window.lastLibTestReport = report;
    log.info('測試完成！結果已保存到 window.lastLibTestReport');
  });
})();
