import os
from flask import Flask, render_template, request, jsonify
from app.evaluators.model_evaluator import ModelEvaluator
from app.evaluators.postprocess_evaluator import PostprocessEvaluator
from app.utils.data_loader import DataLoader


app = Flask(__name__)

# 설정 로드
app.config.from_object('config.default')
app.config.from_envvar('APP_SETTINGS', silent=True)  # 환경 변수에서 추가 설정 로드 (선택사항)

# 평가기 초기화
model_evaluator = ModelEvaluator()
postprocess_evaluator = PostprocessEvaluator()
data_loader = DataLoader()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/model-trends')
def model_trends():
    return render_template('model_trends.html')

@app.route('/postprocess-trends')
def postprocess_trends():
    return render_template('postprocess_trends.html')

@app.route('/api/leaderboard/model')
def model_leaderboard_data():
    metric = request.args.get('metric', 'map')
    search = request.args.get('search', '').lower()
    
    # 모델 평가 데이터 가져오기
    models = model_evaluator.get_leaderboard()
    
    # 검색어로 필터링
    if search:
        models = [m for m in models if search in m['name'].lower()]
    
    # 메트릭에 따라 정렬
    models.sort(key=lambda x: x[metric], reverse=True)
    
    return jsonify(models)

@app.route('/api/leaderboard/postprocess')
def postprocess_leaderboard_data():
    metric = request.args.get('metric', 'accuracy')
    search = request.args.get('search', '').lower()
    
    # 후처리 알고리즘 평가 데이터 가져오기
    algorithms = postprocess_evaluator.get_leaderboard()
    
    # 검색어로 필터링
    if search:
        algorithms = [a for a in algorithms if search in a['name'].lower()]
    
    # 메트릭에 따라 정렬
    algorithms.sort(key=lambda x: x[metric], reverse=True)
    
    return jsonify(algorithms)

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    model_name = data.get('model_name')
    dataset_name = data.get('dataset_name')
    
    # 데이터셋 로드
    dataset = data_loader.load_dataset(dataset_name)
    
    # 모델 평가
    model_results = model_evaluator.evaluate(model_name, dataset)
    
    # 후처리 평가
    postprocess_results = postprocess_evaluator.evaluate(model_name, dataset)
    
    return jsonify({
        'model_results': model_results,
        'postprocess_results': postprocess_results
    })

@app.route('/evaluate/model', methods=['POST'])
def evaluate_model():
    """AI 모델 출력 평가"""
    try:
        data = request.json
        model_output = data.get('model_output')
        ground_truth = data.get('ground_truth')
        
        results = model_evaluator.evaluate(model_output, ground_truth)
        return jsonify({'status': 'success', 'results': results})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/evaluate/postprocess', methods=['POST'])
def evaluate_postprocess():
    """후처리 알고리즘 평가"""
    try:
        data = request.json
        processed_output = data.get('processed_output')
        ground_truth = data.get('ground_truth')
        
        results = postprocess_evaluator.evaluate(processed_output, ground_truth)
        return jsonify({'status': 'success', 'results': results})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/datasets', methods=['GET'])
def get_datasets():
    """사용 가능한 데이터셋 목록 반환"""
    try:
        datasets = data_loader.list_datasets()
        return jsonify({'status': 'success', 'datasets': datasets})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True) 