// 차트 객체
let postprocessChart = null;

// 정렬 상태 관리
let currentSort = {
    column: 'accuracy',
    ascending: true
};

// 차트 초기화
async function initializeChart() {
    try {
        // 데이터 로드
        const response = await fetch('/api/leaderboard/postprocess');
        const data = await response.json();
        
        // 데이터 정렬 (날짜순)
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 차트 생성
        const ctx = document.getElementById('postprocessPerformanceChart').getContext('2d');
        postprocessChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'Accuracy (%)',
                    data: data.map(item => item.accuracy),
                    borderColor: 'rgb(153, 102, 255)',
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
                        text: 'Post-processing Algorithm Performance Trends'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataIndex = context.dataIndex;
                                const item = data[dataIndex];
                                return [
                                    `Algorithm: ${item.name}`,
                                    `${context.dataset.label}: ${item[currentSort.column].toFixed(1)}`,
                                    `Speed: ${item.speed.toFixed(1)} ms`,
                                    `Memory: ${item.memory.toFixed(1)} MB`,
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
    // 최고 정확도
    const maxAccuracyAlgo = data.reduce((prev, current) => 
        prev.accuracy > current.accuracy ? prev : current
    );
    document.getElementById('maxAccuracy').textContent = `${maxAccuracyAlgo.accuracy.toFixed(1)}%`;
    document.getElementById('maxAccuracyAlgo').textContent = maxAccuracyAlgo.name;

    // 최고 처리 속도
    const maxSpeedAlgo = data.reduce((prev, current) => 
        prev.speed < current.speed ? prev : current
    );
    document.getElementById('maxSpeed').textContent = `${maxSpeedAlgo.speed.toFixed(1)}ms`;
    document.getElementById('maxSpeedAlgo').textContent = maxSpeedAlgo.name;

    // 평균 정확도
    const avgAccuracy = data.reduce((sum, item) => sum + item.accuracy, 0) / data.length;
    document.getElementById('avgAccuracy').textContent = `${avgAccuracy.toFixed(1)}%`;

    // 평균 메모리
    const avgMemory = data.reduce((sum, item) => sum + item.memory, 0) / data.length;
    document.getElementById('avgMemory').textContent = `${avgMemory.toFixed(1)}MB`;
}

// 리더보드 업데이트
function updateLeaderboard(data, sortBy = currentSort.column, ascending = currentSort.ascending) {
    const tbody = document.getElementById('postprocessLeaderboardBody');
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
                <a href="#" class="algorithm-link" data-bs-toggle="modal" data-bs-target="#algorithmModal" 
                   data-name="${item.name}" 
                   data-abstract="${item.abstract}"
                   data-image="${item.image_url}">
                    ${item.name}
                </a>
            </td>
            <td>${item.accuracy.toFixed(1)}</td>
            <td>${item.speed.toFixed(1)}</td>
            <td>${item.memory.toFixed(1)}</td>
            <td>${new Date(item.date).toLocaleDateString()}</td>
            <td>
                <a href="${item.paper_url}" target="_blank" class="btn btn-sm btn-outline-primary me-1">Paper</a>
                <a href="${item.code_url}" target="_blank" class="btn btn-sm btn-outline-secondary">Code</a>
            </td>
        `;
        tbody.appendChild(row);
    });

    // 알고리즘 링크 클릭 이벤트 설정
    document.querySelectorAll('.algorithm-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const name = e.target.dataset.name;
            const abstract = e.target.dataset.abstract;
            const image = e.target.dataset.image;
            
            document.getElementById('algorithmModalLabel').textContent = name;
            document.getElementById('algorithmModalAbstract').textContent = abstract;
            document.getElementById('algorithmModalImage').src = image;
        });
    });

    // 트렌드 그래프 업데이트
    updateChart(sortedData, currentSort.column);
}

// 차트 업데이트
function updateChart(data, metric, sortByDate = true) {
    if (!postprocessChart) return;

    const metricConfig = {
        accuracy: {
            label: 'Accuracy (%)',
            color: 'rgb(153, 102, 255)'
        },
        speed: {
            label: 'Speed (ms)',
            color: 'rgb(255, 99, 132)'
        },
        memory: {
            label: 'Memory (MB)',
            color: 'rgb(75, 192, 192)'
        },
        date: {
            label: 'Accuracy (%)',
            color: 'rgb(153, 102, 255)'
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
            metric = 'accuracy'; // Use accuracy for y-axis when sorting by date
        } else {
            sortedData.sort((a, b) => currentSort.ascending ? 
                a[metric] - b[metric] : 
                b[metric] - a[metric]);
        }
    }

    // Update chart data
    postprocessChart.data.labels = sortedData.map(item => new Date(item.date).toLocaleDateString());
    postprocessChart.data.datasets[0] = {
        label: metricConfig[metric]?.label || 'Accuracy (%)',
        data: sortedData.map(item => item[metric] || item.accuracy),
        borderColor: metricConfig[metric]?.color || 'rgb(153, 102, 255)',
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8
    };

    // Update tooltip callback
    postprocessChart.options.plugins.tooltip.callbacks.label = function(context) {
        const dataIndex = context.dataIndex;
        const item = sortedData[dataIndex];
        return [
            `Algorithm: ${item.name}`,
            `${context.dataset.label}: ${item[metric]?.toFixed(1) || item.accuracy.toFixed(1)}`,
            `Speed: ${item.speed.toFixed(1)} ms`,
            `Memory: ${item.memory.toFixed(1)} MB`,
            `Release Date: ${new Date(item.date).toLocaleDateString()}`
        ];
    };

    // Update data labels
    postprocessChart.options.plugins.datalabels.formatter = function(value, context) {
        return sortedData[context.dataIndex].name;
    };

    postprocessChart.update();
}

// 검색 기능
function setupSearch() {
    const searchInput = document.getElementById('postprocessSearchInput');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const response = await fetch('/api/leaderboard/postprocess');
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

            const response = await fetch('/api/leaderboard/postprocess');
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
            const response = await fetch('/api/leaderboard/postprocess');
            const data = await response.json();

            // Update chart and leaderboard
            currentSort.column = metric === 'date' ? 'accuracy' : metric;
            currentSort.ascending = true;
            // Always sort by date for trend graph buttons
            updateChart(data, currentSort.column, true);
            updateLeaderboard(data, currentSort.column, currentSort.ascending);
        });
    });
}); 