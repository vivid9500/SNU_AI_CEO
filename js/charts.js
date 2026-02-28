/* === Chart.js Chart Definitions === */
const Charts = (() => {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded yet');
        return {};
    }

    // Global Chart.js dark theme defaults
    Chart.defaults.color = '#a0a0b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.font.family = "'Pretendard', sans-serif";

    // Generate correlated data points
    function generateCorrelatedData(n, targetR) {
        const points = [];
        // Use a simple method: generate x, then y = r*x + sqrt(1-r^2)*noise
        for (let i = 0; i < n; i++) {
            const x = 50 + Math.random() * 450; // product registrations: 50-500
            const noise = (Math.random() - 0.5) * 2;
            const y = targetR * (x * 0.8) + Math.sqrt(1 - targetR * targetR) * noise * 200 + 50;
            points.push({ x: Math.round(x), y: Math.max(20, Math.round(y)) });
        }
        return points;
    }

    // Compute trend line from data
    function getTrendLine(data) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (const p of data) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const minX = Math.min(...data.map(p => p.x));
        const maxX = Math.max(...data.map(p => p.x));
        return [
            { x: minX, y: slope * minX + intercept },
            { x: maxX, y: slope * maxX + intercept }
        ];
    }

    function initCorrelationChart() {
        const ctx = document.getElementById('chart-correlation');
        if (!ctx) return;

        const data = generateCorrelatedData(35, 0.81);
        const trendLine = getTrendLine(data);

        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: '상품등록수 vs 거래확정금액',
                        data: data,
                        backgroundColor: 'rgba(74, 158, 255, 0.5)',
                        borderColor: 'rgba(74, 158, 255, 0.8)',
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBorderWidth: 1,
                    },
                    {
                        type: 'line',
                        label: '추세선 (r = 0.81)',
                        data: trendLine,
                        borderColor: '#8b5cf6',
                        borderWidth: 2,
                        borderDash: [8, 4],
                        pointRadius: 0,
                        fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyleWidth: 10,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 46, 0.95)',
                        titleColor: '#e8e8f0',
                        bodyColor: '#a0a0b8',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) {
                                return `등록수: ${ctx.parsed.x}  |  거래액: ${ctx.parsed.y}백만원`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '상품 등록수',
                            color: '#a0a0b8',
                            font: { size: 13 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#6b6b80' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '거래확정금액 (백만원)',
                            color: '#a0a0b8',
                            font: { size: 13 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#6b6b80' }
                    }
                }
            }
        });
    }

    // Initialize charts when slide becomes visible
    let chartInitialized = false;
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !chartInitialized) {
                chartInitialized = true;
                initCorrelationChart();
            }
        });
    }, { threshold: 0.3 });

    const slide2 = document.getElementById('slide-2');
    if (slide2) chartObserver.observe(slide2);

    return { initCorrelationChart };
})();
