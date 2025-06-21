// 股票功能模組
let currentPage = 1;
let currentSearch = '';
let currentExchange = '';

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏢 Stocks page initializing...');

  // 等待必要模組載入
  setTimeout(() => {
    if (window.fetchWithAuth && window.templateEngine) {
      initializePage();
    } else {
      console.warn('⏳ Waiting for dependencies...');
      setTimeout(initializePage, 500);
    }
  }, 100);
});

async function initializePage() {
  try {
    // 導航欄會由 template.js 自動載入
    console.log('🏢 Initializing stocks page...');

    // 初始化事件監聽器
    initializeEventListeners();

    // 載入初始數據
    await Promise.all([loadStocksList(), loadWatchedStocks(), loadMarketStats()]);

    console.log('✅ Stocks page initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize stocks page:', error);
    showError('頁面初始化失敗');
  }
}

function initializeEventListeners() {
  // 搜尋按鈕
  document.getElementById('search-btn').addEventListener('click', handleSearch);

  // 搜尋輸入框回車
  document.getElementById('stock-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // 交易所篩選
  document.getElementById('exchange-filter').addEventListener('change', handleSearch);

  // 分頁按鈕
  document.getElementById('prev-page').addEventListener('click', () => changePage(currentPage - 1));
  document.getElementById('next-page').addEventListener('click', () => changePage(currentPage + 1));

  // 模態框關閉
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('stock-modal').addEventListener('click', function (e) {
    if (e.target === this) {
      closeModal();
    }
  });
}

async function loadStocksList(page = 1) {
  try {
    showLoading('stocks-table-body');

    const params = new URLSearchParams({
      page: page,
      per_page: 20,
    });

    if (currentSearch) {
      params.append('search', currentSearch);
    }

    if (currentExchange) {
      params.append('exchange', currentExchange);
    }

    const response = await window.fetchWithAuth(`/api/stocks?${params}`);

    if (response.stocks) {
      renderStocksList(response.stocks);
      updatePagination(response.pagination);
    } else {
      showError('無法載入股票列表');
    }
  } catch (error) {
    console.error('Failed to load stocks:', error);
    showError('載入股票列表失敗');
  }
}

function renderStocksList(stocks) {
  const tbody = document.getElementById('stocks-table-body');

  if (!stocks || stocks.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-gray-500 py-8">暫無股票資料</td></tr>';
    return;
  }

  tbody.innerHTML = stocks
    .map((stock) => {
      const latestPrice = stock.latest_price;
      const price = latestPrice ? parseFloat(latestPrice.close_price) : 0;
      const change = latestPrice ? parseFloat(latestPrice.change_amount) : 0;
      const changeClass =
        change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
      const changeSymbol = change > 0 ? '+' : '';

      return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${stock.symbol}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${stock.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${stock.exchange || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${price ? price.toFixed(2) : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${changeClass}">
                    ${change ? `${changeSymbol}${change.toFixed(2)}` : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="viewStock('${stock.symbol}')"
                            class="text-indigo-600 hover:text-indigo-900">查看</button>
                    <button onclick="toggleWatchStock('${stock.symbol}')"
                            class="text-green-600 hover:text-green-900">關注</button>
                </td>
            </tr>
        `;
    })
    .join('');
}

async function loadWatchedStocks() {
  try {
    const response = await window.fetchWithAuth('/api/stocks/user');

    if (response.stocks) {
      renderWatchedStocks(response.stocks);
    }
  } catch (error) {
    console.error('Failed to load watched stocks:', error);
    document.getElementById('watched-stocks').innerHTML =
      '<div class="text-center text-gray-500 py-4 col-span-full">載入關注股票失敗</div>';
  }
}

function renderWatchedStocks(stocks) {
  const container = document.getElementById('watched-stocks');

  if (!stocks || stocks.length === 0) {
    container.innerHTML =
      '<div class="text-center text-gray-500 py-4 col-span-full">暫無關注的股票</div>';
    return;
  }

  container.innerHTML = stocks
    .map((stock) => {
      const latestPrice = stock.latest_price;
      const price = latestPrice ? parseFloat(latestPrice.close_price) : 0;
      const change = latestPrice ? parseFloat(latestPrice.change_amount) : 0;
      const changePercent = latestPrice ? latestPrice.change_percentage : 0;
      const changeClass =
        change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
      const changeSymbol = change > 0 ? '+' : '';

      return `
            <div class="bg-gray-50 p-4 rounded-lg border hover:border-indigo-200 cursor-pointer"
                 onclick="viewStock('${stock.symbol}')">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-semibold text-gray-900">${stock.symbol}</h3>
                        <p class="text-sm text-gray-600">${stock.name}</p>
                    </div>
                    <button onclick="event.stopPropagation(); toggleWatchStock('${stock.symbol}')"
                            class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex justify-between items-end">
                    <div class="text-lg font-semibold text-gray-900">
                        ${price ? price.toFixed(2) : '-'}
                    </div>
                    <div class="text-sm ${changeClass}">
                        ${change ? `${changeSymbol}${change.toFixed(2)} (${changePercent}%)` : '-'}
                    </div>
                </div>
            </div>
        `;
    })
    .join('');
}

async function loadMarketStats() {
  try {
    const response = await window.fetchWithAuth('/api/stocks/statistics');

    if (response) {
      renderMarketStats(response);
    }
  } catch (error) {
    console.error('Failed to load market stats:', error);
    document.getElementById('market-stats').innerHTML =
      '<div class="text-center text-gray-500 py-4 col-span-full">載入市場統計失敗</div>';
  }
}

function renderMarketStats(stats) {
  const container = document.getElementById('market-stats');

  container.innerHTML = `
        <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">${stats.total_stocks || 0}</div>
            <div class="text-sm text-gray-600">總股票數</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">${stats.listed_stocks || 0}</div>
            <div class="text-sm text-gray-600">上市股票</div>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">${stats.otc_stocks || 0}</div>
            <div class="text-sm text-gray-600">上櫃股票</div>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">${stats.total_records || 0}</div>
            <div class="text-sm text-gray-600">價格記錄</div>
        </div>
    `;
}

function handleSearch() {
  currentSearch = document.getElementById('stock-search').value.trim();
  currentExchange = document.getElementById('exchange-filter').value;
  currentPage = 1;
  loadStocksList(currentPage);
}

function changePage(page) {
  if (page < 1) return;
  currentPage = page;
  loadStocksList(currentPage);
}

function updatePagination(pagination) {
  document.getElementById('page-info').textContent =
    `${(pagination.page - 1) * pagination.per_page + 1}-${Math.min(pagination.page * pagination.per_page, pagination.total)}`;
  document.getElementById('total-count').textContent = pagination.total;

  document.getElementById('prev-page').disabled = !pagination.has_prev;
  document.getElementById('next-page').disabled = !pagination.has_next;
}

async function viewStock(symbol) {
  try {
    showModal();
    document.getElementById('modal-title').textContent = `股票詳情 - ${symbol}`;
    document.getElementById('modal-content').innerHTML =
      '<div class="text-center py-8">載入中...</div>';

    // 載入股票詳情
    const stockResponse = await window.fetchWithAuth(`/api/stocks/${symbol}`);
    const historyResponse = await window.fetchWithAuth(`/api/stocks/${symbol}/history?days=30`);

    renderStockDetail(stockResponse, historyResponse);
  } catch (error) {
    console.error('Failed to load stock detail:', error);
    document.getElementById('modal-content').innerHTML =
      '<div class="text-center py-8 text-red-600">載入股票詳情失敗</div>';
  }
}

function renderStockDetail(stock, history) {
  const latestPrice = stock.latest_price;
  const change = latestPrice ? parseFloat(latestPrice.change_amount) : 0;
  const changeClass = change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
  const changeSymbol = change > 0 ? '+' : '';

  document.getElementById('modal-content').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 基本資訊 -->
            <div>
                <h4 class="text-lg font-semibold mb-4">基本資訊</h4>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">股票代號:</span>
                        <span class="font-medium">${stock.symbol}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">股票名稱:</span>
                        <span class="font-medium">${stock.name}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">交易所:</span>
                        <span class="font-medium">${stock.exchange || '-'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">市場類型:</span>
                        <span class="font-medium">${stock.market_type || '-'}</span>
                    </div>
                </div>

                ${
                  latestPrice
                    ? `
                <h4 class="text-lg font-semibold mt-6 mb-4">最新價格</h4>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">收盤價:</span>
                        <span class="text-xl font-bold">${parseFloat(latestPrice.close_price).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">漲跌:</span>
                        <span class="font-medium ${changeClass}">${changeSymbol}${change.toFixed(2)} (${latestPrice.change_percentage}%)</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">開盤價:</span>
                        <span class="font-medium">${parseFloat(latestPrice.open_price).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">最高價:</span>
                        <span class="font-medium">${parseFloat(latestPrice.high_price).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">最低價:</span>
                        <span class="font-medium">${parseFloat(latestPrice.low_price).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">成交量:</span>
                        <span class="font-medium">${latestPrice.volume ? parseInt(latestPrice.volume).toLocaleString() : '-'}</span>
                    </div>
                </div>
                `
                    : '<p class="text-gray-500 mt-6">暫無價格資料</p>'
                }
            </div>

            <!-- 價格走勢圖 -->
            <div>
                <h4 class="text-lg font-semibold mb-4">30日價格走勢</h4>
                <div style="height: 300px">
                    <canvas id="price-chart"></canvas>
                </div>
            </div>
        </div>

        <div class="mt-6 flex gap-3">
            <button onclick="toggleWatchStock('${stock.symbol}')"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                關注股票
            </button>
            <button onclick="closeModal()"
                    class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors">
                關閉
            </button>
        </div>
    `;

  // 繪製價格走勢圖
  if (history && history.history && history.history.length > 0) {
    setTimeout(() => {
      drawPriceChart(history.history);
    }, 100);
  }
}

function drawPriceChart(historyData) {
  const ctx = document.getElementById('price-chart');
  if (!ctx) return;

  const labels = historyData.map((item) => item.trade_date);
  const closePrices = historyData.map((item) => parseFloat(item.close_price));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '收盤價',
          data: closePrices,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

async function toggleWatchStock(symbol) {
  try {
    // 這裡應該實作關注/取消關注功能
    const response = await window.fetchWithAuth(`/api/stocks/${symbol}/follow`, {
      method: 'POST',
    });

    if (response.message) {
      showSuccess(response.message);
      // 重新載入關注股票列表
      await loadWatchedStocks();
    }
  } catch (error) {
    console.error('Failed to toggle watch stock:', error);
    showError('操作失敗');
  }
}

function showModal() {
  document.getElementById('stock-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('stock-modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML =
      '<tr><td colspan="6" class="text-center text-gray-500 py-8">載入中...</td></tr>';
  }
}

function showError(message) {
  // 簡單的錯誤顯示，可以改為更好的通知系統
  alert(message);
}

function showSuccess(message) {
  // 簡單的成功顯示，可以改為更好的通知系統
  alert(message);
}

// 全域函數，供 HTML 調用
window.viewStock = viewStock;
window.toggleWatchStock = toggleWatchStock;
