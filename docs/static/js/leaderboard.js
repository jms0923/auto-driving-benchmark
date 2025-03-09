// 리더보드 데이터
const leaderboardData = {
    models: [
        {
            name: 'RT-DETR-L',
            map: 53.0,
            fps: 114,
            inputSize: '640x640',
            date: '2024-01',
            paper: 'https://arxiv.org/abs/2304.08069',
            code: 'https://github.com/PaddlePaddle/PaddleDetection'
        },
        {
            name: 'YOLOv8x',
            map: 53.9,
            fps: 87,
            inputSize: '640x640',
            date: '2023-01',
            paper: 'https://arxiv.org/abs/2301.10401',
            code: 'https://github.com/ultralytics/ultralytics'
        },
        // 추가 모델 데이터...
    ]
};

// 차트 설정
const chartConfigs = {
    model: {
        element: 'modelPerformanceChart',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'mAP (%)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        }
    },
    postprocess: {
        element: 'postprocessPerformanceChart',
        data: {
            labels: [],
            datasets: [
                {
                    label: '정확도 (%)',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1
                }
            ]
        }
    }
};

// 차트 객체 초기화
const charts = {
    model: null,
    postprocess: null
};

// 리더보드 데이터 로드 및 표시
async function loadLeaderboard(boardType) {
    try {
        const response = await fetch(`/api/leaderboard/${boardType}`);
        const data = await response.json();
        updateLeaderboard(boardType, data);
    } catch (error) {
        console.error(`${boardType} 리더보드 로드 중 오류 발생:`, error);
    }
}

// 리더보드 업데이트
function updateLeaderboard(boardType, data) {
    const tbody = document.getElementById(`${boardType}LeaderboardBody`);
    tbody.innerHTML = '';

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            ${boardType === 'model' ? `
                <td>${item.map.toFixed(2)}</td>
                <td>${item.fps.toFixed(1)}</td>
                <td>${item.input_size}</td>
            ` : `
                <td>${item.accuracy.toFixed(2)}</td>
                <td>${item.speed.toFixed(1)}</td>
                <td>${item.memory.toFixed(1)}</td>
            `}
            <td>${new Date(item.date).toLocaleDateString()}</td>
            <td>
                <a href="${item.paper_url}" target="_blank" class="btn btn-sm btn-outline-primary me-1">논문</a>
                <a href="${item.code_url}" target="_blank" class="btn btn-sm btn-outline-secondary">코드</a>
            </td>
        `;
        tbody.appendChild(row);
    });

    // 차트 데이터 업데이트
    updateChart(boardType, data);
}

// 차트 데이터 업데이트
function updateChart(boardType, data) {
    const chart = charts[boardType];
    const metric = boardType === 'model' ? 'map' : 'accuracy';
    
    chart.data.labels = data.map(item => item.name);
    chart.data.datasets[0].data = data.map(item => item[metric]);
    chart.update();
}

// 검색 기능
function setupSearch(boardType) {
    const searchInput = document.getElementById(`${boardType}SearchInput`);
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const response = await fetch(`/api/leaderboard/${boardType}?search=${searchTerm}`);
        const data = await response.json();
        updateLeaderboard(boardType, data);
    });
}

// 정렬 기능
function setupSort(boardType) {
    document.querySelectorAll(`[data-sort][data-board="${boardType}"]`).forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const metric = e.target.dataset.sort;
            const response = await fetch(`/api/leaderboard/${boardType}?metric=${metric}`);
            const data = await response.json();
            updateLeaderboard(boardType, data);
        });
    });
}

// 탭 변경 이벤트 처리
function setupTabs() {
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target').replace('#', '');
            loadLeaderboard(targetId);
        });
    });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 초기 데이터 로드
    loadLeaderboard('model');
    loadLeaderboard('postprocess');

    // 검색 및 정렬 기능 설정
    setupSearch('model');
    setupSearch('postprocess');
    setupSort('model');
    setupSort('postprocess');

    // 탭 이벤트 설정
    setupTabs();
}); 