"""
기본 설정 파일
"""

# Flask 애플리케이션 설정
DEBUG = True
SECRET_KEY = 'your-secret-key-here'  # 실제 운영 환경에서는 안전한 키로 변경해야 함

# 데이터 관련 설정
DATA_DIR = 'data'
ALLOWED_EXTENSIONS = {'json', 'csv', 'txt'}

# 평가 관련 설정
METRICS = {
    'detection': ['mAP', 'IoU'],
    'segmentation': ['pixel_accuracy', 'IoU'],
    'depth': ['RMSE', 'MAE']
}

# 후처리 관련 설정
POSTPROCESS_METHODS = {
    'tracking': ['SORT', 'DeepSORT'],
    'filtering': ['Kalman', 'Particle'],
    'fusion': ['Weighted', 'Bayesian']
} 