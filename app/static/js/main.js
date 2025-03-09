document.addEventListener('DOMContentLoaded', function() {
    // AI 모델 평가 폼 제출 처리
    const modelEvalForm = document.getElementById('modelEvalForm');
    modelEvalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('model_output', document.getElementById('modelOutput').files[0]);
        formData.append('ground_truth', document.getElementById('modelGroundTruth').files[0]);
        formData.append('task_type', document.getElementById('modelType').value);
        
        try {
            const response = await fetch('/evaluate/model', {
                method: 'POST',
                body: formData
            });
            
            const results = await response.json();
            if (results.status === 'success') {
                displayModelResults(results.results);
            } else {
                alert('평가 중 오류가 발생했습니다: ' + results.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('평가 요청 중 오류가 발생했습니다.');
        }
    });
    
    // 후처리 평가 폼 제출 처리
    const postprocessEvalForm = document.getElementById('postprocessEvalForm');
    postprocessEvalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('processed_output', document.getElementById('processOutput').files[0]);
        formData.append('ground_truth', document.getElementById('processGroundTruth').files[0]);
        formData.append('process_type', document.getElementById('processType').value);
        
        try {
            const response = await fetch('/evaluate/postprocess', {
                method: 'POST',
                body: formData
            });
            
            const results = await response.json();
            if (results.status === 'success') {
                displayProcessResults(results.results);
            } else {
                alert('평가 중 오류가 발생했습니다: ' + results.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('평가 요청 중 오류가 발생했습니다.');
        }
    });
});

function displayModelResults(results) {
    const resultsDiv = document.getElementById('modelResults');
    let html = '<h6 class="mt-4">평가 결과:</h6>';
    html += '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th>메트릭</th><th>값</th></tr></thead><tbody>';
    
    for (const [metric, value] of Object.entries(results)) {
        html += `<tr><td>${formatMetricName(metric)}</td><td>${formatValue(value)}</td></tr>`;
    }
    
    html += '</tbody></table></div>';
    
    // 시각화 추가
    html += '<div id="modelChart" class="mt-3"></div>';
    resultsDiv.innerHTML = html;
    
    // Plotly를 사용한 차트 생성
    createChart('modelChart', results);
}

function displayProcessResults(results) {
    const resultsDiv = document.getElementById('processResults');
    let html = '<h6 class="mt-4">평가 결과:</h6>';
    html += '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th>메트릭</th><th>값</th></tr></thead><tbody>';
    
    for (const [metric, value] of Object.entries(results)) {
        html += `<tr><td>${formatMetricName(metric)}</td><td>${formatValue(value)}</td></tr>`;
    }
    
    html += '</tbody></table></div>';
    
    // 시각화 추가
    html += '<div id="processChart" class="mt-3"></div>';
    resultsDiv.innerHTML = html;
    
    // Plotly를 사용한 차트 생성
    createChart('processChart', results);
}

function formatMetricName(metric) {
    return metric
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatValue(value) {
    if (typeof value === 'number') {
        return value.toFixed(4);
    }
    return value;
}

function createChart(elementId, data) {
    const metrics = Object.keys(data);
    const values = Object.values(data);
    
    const chartData = [{
        type: 'bar',
        x: metrics.map(formatMetricName),
        y: values,
        marker: {
            color: 'rgb(55, 83, 109)'
        }
    }];
    
    const layout = {
        title: '평가 메트릭 시각화',
        font: {size: 12},
        height: 300,
        margin: {t: 30, b: 80, l: 60, r: 20}
    };
    
    Plotly.newPlot(elementId, chartData, layout);
} 