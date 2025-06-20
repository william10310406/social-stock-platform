// chart.js - Stock chart functionality

console.log('chart.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('stockChart');
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        datasets: [
          {
            label: '股票價格 (USD)',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '股票走勢圖',
          },
        },
      },
    });
  } else if (!ctx) {
    console.log('Stock chart element not found');
  } else {
    console.log('Chart.js library not loaded');
  }
});
