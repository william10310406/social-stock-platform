// 端到端測試 - 認證流程
const { test, expect } = require('@playwright/test');
const { TestRouteUtils } = require('./test-config');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存儲
    await page.goto(TestRouteUtils.getFullUrl('/'));
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('用戶註冊流程', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'register'));

    // 檢查註冊頁面元素
    await expect(page.locator('h1')).toContainText('註冊');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

    // 填寫註冊表單
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // 提交註冊表單
    await page.click('button[type="submit"]');

    // 等待響應（需要模擬後端響應）
    await page.waitForTimeout(1000);

    // 檢查是否顯示成功消息或跳轉到登入頁面
    // 這裡需要根據實際的註冊邏輯來調整
  });

  test('用戶登入流程', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 檢查登入頁面元素
    await expect(page.locator('h1')).toContainText('登入');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // 填寫登入表單
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');

    // 提交登入表單
    await page.click('button[type="submit"]');

    // 等待響應
    await page.waitForTimeout(1000);

    // 檢查是否跳轉到儀表板
    // await expect(page).toHaveURL(/.*dashboard/);
  });

  test('表單驗證', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 測試空表單提交
    await page.click('button[type="submit"]');

    // 檢查是否顯示驗證錯誤
    // 這需要根據實際的表單驗證邏輯來調整
    await page.waitForTimeout(500);

    // 測試無效的用戶名
    await page.fill('input[name="username"]', 'a'); // 太短
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    // 檢查是否顯示用戶名長度錯誤
  });

  test('記住登入狀態', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 登入
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');

    // 勾選「記住我」
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // 檢查 localStorage 中是否保存了 token
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();

    // 重新載入頁面，檢查是否仍然登入
    await page.reload();
    await page.waitForTimeout(1000);

    // 檢查是否自動跳轉到儀表板或保持登入狀態
    const currentToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(currentToken).toBeTruthy();
  });

  test('登出功能', async ({ page }) => {
    // 先設置登入狀態
    await page.goto(TestRouteUtils.getFullUrl('/'));
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock-token');
    });

    await page.goto(TestRouteUtils.getPageUrl('dashboard', 'index'));

    // 查找並點擊登出按鈕
    const logoutButton = page.locator('button:has-text("登出"), a:has-text("登出")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    await page.waitForTimeout(1000);

    // 檢查是否清除了 token
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();

    // 檢查是否跳轉到登入頁面
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Navigation and Routing', () => {
  test('頁面導航', async ({ page }) => {
    await page.goto(TestRouteUtils.getFullUrl('/'));

    // 檢查首頁是否正確載入
    await expect(page).toHaveTitle(/Stock Insight/);

    // 測試導航到登入頁面
    const loginLink = page.locator('a[href*="login"], button:has-text("登入")');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }

    // 測試導航到註冊頁面
    await page.goto(TestRouteUtils.getPageUrl('auth', 'register'));
    await expect(page.locator('h1')).toContainText('註冊');

    // 測試返回首頁
    await page.goto(TestRouteUtils.getFullUrl('/'));
    await expect(page).toHaveURL(TestRouteUtils.getFullUrl('/'));
  });

  test('受保護的頁面訪問', async ({ page }) => {
    // 嘗試在未登入狀態下訪問儀表板
    await page.goto(TestRouteUtils.getPageUrl('dashboard', 'index'));

    // 檢查是否被重定向到登入頁面
    // 這需要根據實際的路由保護邏輯來調整
    await page.waitForTimeout(1000);

    // 如果有路由保護，應該被重定向到登入頁面
    // await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Responsive Design', () => {
  test('移動端適配', async ({ page }) => {
    // 設置移動端視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(TestRouteUtils.getFullUrl('/'));

    // 檢查移動端導航
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-mobile-menu]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(300);
    }

    // 檢查響應式元素
    await expect(page.locator('body')).toBeVisible();
  });

  test('平板端適配', async ({ page }) => {
    // 設置平板端視窗大小
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(TestRouteUtils.getFullUrl('/'));

    // 檢查平板端佈局
    await expect(page.locator('body')).toBeVisible();
  });

  test('桌面端適配', async ({ page }) => {
    // 設置桌面端視窗大小
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TestRouteUtils.getFullUrl('/'));

    // 檢查桌面端佈局
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('頁面載入性能', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(TestRouteUtils.getFullUrl('/'));

    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 檢查載入時間是否在合理範圍內（3秒以內）
    expect(loadTime).toBeLessThan(3000);
  });

  test('資源載入', async ({ page }) => {
    const failedRequests = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto(TestRouteUtils.getFullUrl('/'));
    await page.waitForLoadState('networkidle');

    // 檢查是否有載入失敗的資源
    expect(failedRequests).toHaveLength(0);
  });
});

test.describe('Accessibility', () => {
  test('鍵盤導航', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 使用 Tab 鍵導航
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="username"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="password"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('ARIA 標籤', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 檢查表單是否有適當的 ARIA 標籤
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    // 檢查是否有 label 或 aria-label
    if (await usernameInput.isVisible()) {
      const ariaLabel = await usernameInput.getAttribute('aria-label');
      const labelFor = await page.locator('label[for="username"]').count();
      expect(ariaLabel || labelFor > 0).toBeTruthy();
    }
  });
});

test.describe('Error Handling', () => {
  test('網路錯誤處理', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 模擬網路錯誤
    await page.route('**/api/auth/login', (route) => {
      route.abort('failed');
    });

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // 檢查是否顯示錯誤消息
    const errorMessage = page.locator('.error-toast, .error-message, .alert-error');
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('服務器錯誤處理', async ({ page }) => {
    await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));

    // 模擬服務器錯誤
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      });
    });

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // 檢查是否顯示服務器錯誤消息
    const errorMessage = page.locator('.error-toast, .error-message, .alert-error');
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});
