import Chart from 'chart.js/auto';

console.log('chart.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('stockChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: 'Stock Price (USD)',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}); 