// 차트 객체
let modelChart = null;

// 정렬 상태 관리
let currentSort = {
    column: 'map',
    ascending: true
};

// 차트 초기화
async function initializeChart() {
    try {
        // API 대신 정적 JSON 파일 사용
        const response = await fetch('static/data/model_leaderboard.json');
        const data = await response.json();
        
        // 데이터 정렬 (날짜순)
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 차트 생성
        const ctx = document.getElementById('modelPerformanceChart').getContext('2d');
        modelChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'mAP (%)',
                    data: data.map(item => item.map),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Model Performance Trends'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataIndex = context.dataIndex;
                                const item = data[dataIndex];
                                return [
                                    `Model: ${item.name}`,
                                    `${context.dataset.label}: ${item[currentSort.column].toFixed(1)}`,
                                    `Input Size: ${item.input_size}`,
                                    `Release Date: ${new Date(item.date).toLocaleDateString()}`
                                ];
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        align: 'top',
                        offset: 10,
                        color: 'rgb(75, 75, 75)',
                        font: {
                            size: 11
                        },
                        formatter: function(value, context) {
                            return data[context.dataIndex].name;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // 통계 업데이트
        updateStats(data);
        // 리더보드 업데이트 (초기 정렬 상태 적용)
        updateLeaderboard(data, currentSort.column, currentSort.ascending);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// 통계 업데이트
function updateStats(data) {
    // 최고 mAP
    const maxMapModel = data.reduce((prev, current) => 
        prev.map > current.map ? prev : current
    );
    document.getElementById('maxMap').textContent = `${maxMapModel.map.toFixed(1)}%`;
    document.getElementById('maxMapModel').textContent = maxMapModel.name;

    // 최고 FPS
    const maxFpsModel = data.reduce((prev, current) => 
        prev.fps > current.fps ? prev : current
    );
    document.getElementById('maxFps').textContent = maxFpsModel.fps.toFixed(1);
    document.getElementById('maxFpsModel').textContent = maxFpsModel.name;

    // 평균 mAP
    const avgMap = data.reduce((sum, item) => sum + item.map, 0) / data.length;
    document.getElementById('avgMap').textContent = `${avgMap.toFixed(1)}%`;

    // 평균 FPS
    const avgFps = data.reduce((sum, item) => sum + item.fps, 0) / data.length;
    document.getElementById('avgFps').textContent = avgFps.toFixed(1);
}

// 리더보드 업데이트
function updateLeaderboard(data, sortBy = currentSort.column, ascending = currentSort.ascending) {
    const tbody = document.getElementById('modelLeaderboardBody');
    tbody.innerHTML = '';

    // 정렬
    const sortedData = [...data].sort((a, b) => {
        if (sortBy === 'date') {
            return ascending ? 
                new Date(a.date) - new Date(b.date) : 
                new Date(b.date) - new Date(a.date);
        }
        return ascending ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    });

    // 정렬 방향 표시 업데이트
    document.querySelectorAll('.sort-arrow').forEach(arrow => arrow.remove());
    document.querySelectorAll('.metric-header').forEach(header => {
        header.classList.remove('active');
        if (header.dataset.sort === sortBy) {
            header.classList.add('active');
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow ms-1';
            arrow.textContent = ascending ? '↑' : '↓';
            header.appendChild(arrow);
        }
    });

    // 현재 정렬 상태 업데이트
    currentSort.column = sortBy;
    currentSort.ascending = ascending;

    sortedData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <a href="#" class="model-link" data-bs-toggle="modal" data-bs-target="#modelModal" 
                   data-name="${item.name}" 
                   data-abstract="${item.abstract}"
                   data-image="${item.image_url}">
                    ${item.name}
                </a>
            </td>
            <td>${item.map.toFixed(1)}</td>
            <td>${item.fps.toFixed(1)}</td>
            <td>${item.input_size}</td>
            <td>${new Date(item.date).toLocaleDateString()}</td>
            <td>
                <a href="${item.paper_url}" target="_blank" class="btn btn-sm btn-outline-primary me-1">Paper</a>
                <a href="${item.code_url}" target="_blank" class="btn btn-sm btn-outline-secondary">Code</a>
            </td>
        `;
        tbody.appendChild(row);
    });

    // 모델 링크 클릭 이벤트 설정
    document.querySelectorAll('.model-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const name = e.target.dataset.name;
            const abstract = e.target.dataset.abstract;
            const image = e.target.dataset.image;
            
            document.getElementById('modelModalLabel').textContent = name;
            document.getElementById('modelModalAbstract').textContent = abstract;
            document.getElementById('modelModalImage').src = image;
        });
    });

    // 트렌드 그래프 업데이트
    updateChart(sortedData, currentSort.column);
}

// 차트 업데이트
function updateChart(data, metric, sortByDate = true) {
    if (!modelChart) return;

    const metricConfig = {
        map: {
            label: 'mAP (%)',
            color: 'rgb(75, 192, 192)'
        },
        fps: {
            label: 'FPS',
            color: 'rgb(255, 99, 132)'
        },
        date: {
            label: 'mAP (%)',
            color: 'rgb(75, 192, 192)'
        }
    };

    // Sort data based on parameter
    let sortedData = [...data];
    if (sortByDate) {
        sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        if (metric === 'date') {
            sortedData.sort((a, b) => currentSort.ascending ? 
                new Date(a.date) - new Date(b.date) : 
                new Date(b.date) - new Date(a.date));
            metric = 'map'; // Use mAP for y-axis when sorting by date
        } else {
            sortedData.sort((a, b) => currentSort.ascending ? 
                a[metric] - b[metric] : 
                b[metric] - a[metric]);
        }
    }

    // Update chart data
    modelChart.data.labels = sortedData.map(item => new Date(item.date).toLocaleDateString());
    modelChart.data.datasets[0] = {
        label: metricConfig[metric]?.label || 'mAP (%)',
        data: sortedData.map(item => item[metric] || item.map),
        borderColor: metricConfig[metric]?.color || 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8
    };

    // Update tooltip callback
    modelChart.options.plugins.tooltip.callbacks.label = function(context) {
        const dataIndex = context.dataIndex;
        const item = sortedData[dataIndex];
        return [
            `Model: ${item.name}`,
            `${context.dataset.label}: ${item[metric]?.toFixed(1) || item.map.toFixed(1)}`,
            `Input Size: ${item.input_size}`,
            `Release Date: ${new Date(item.date).toLocaleDateString()}`
        ];
    };

    // Update data labels
    modelChart.options.plugins.datalabels.formatter = function(value, context) {
        return sortedData[context.dataIndex].name;
    };

    modelChart.update();
}

// 검색 기능
function setupSearch() {
    const searchInput = document.getElementById('modelSearchInput');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const response = await fetch('static/data/model_leaderboard.json');
        const data = await response.json();
        const filteredData = data.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        updateLeaderboard(filteredData);
    });
}

// 정렬 기능
function setupSort() {
    document.querySelectorAll('.metric-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', async () => {
            const metric = header.dataset.sort;
            
            // Toggle sort direction if same column is clicked
            if (metric === currentSort.column) {
                currentSort.ascending = !currentSort.ascending;
            } else {
                currentSort.column = metric;
                currentSort.ascending = true;
            }

            const response = await fetch('static/data/model_leaderboard.json');
            const data = await response.json();
            
            // Update leaderboard and chart with current sort settings
            updateLeaderboard(data, currentSort.column, currentSort.ascending);
            // Update chart with same sorting as leaderboard
            const sortedData = [...data].sort((a, b) => 
                currentSort.ascending ? a[currentSort.column] - b[currentSort.column] : b[currentSort.column] - a[currentSort.column]
            );
            updateChart(sortedData, currentSort.column, false);
        });
    });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // Register Chart.js DataLabels plugin
    Chart.register(ChartDataLabels);
    
    initializeChart();
    setupSearch();
    setupSort();

    // Metric button events
    document.querySelectorAll('[data-metric]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const metric = e.target.dataset.metric;
            
            // Update button styles
            document.querySelectorAll('[data-metric]').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Load fresh data
            const response = await fetch('static/data/model_leaderboard.json');
            const data = await response.json();

            // Update chart and leaderboard
            currentSort.column = metric === 'date' ? 'map' : metric;
            currentSort.ascending = true;
            // Always sort by date for trend graph buttons
            updateChart(data, currentSort.column, true);
            updateLeaderboard(data, currentSort.column, currentSort.ascending);
        });
    });
}); 