class PostprocessEvaluator:
    def __init__(self):
        # 예시 데이터
        self.leaderboard_data = [
            {
                'name': 'NMS-Ensemble',
                'accuracy': 95.2,
                'speed': 2.1,
                'memory': 128.5,
                'date': '2023-02-15',
                'paper_url': 'https://example.com/nms-ensemble',
                'code_url': 'https://github.com/example/nms-ensemble'
            },
            {
                'name': 'Soft-NMS',
                'accuracy': 93.8,
                'speed': 1.8,
                'memory': 96.0,
                'date': '2022-11-20',
                'paper_url': 'https://example.com/soft-nms',
                'code_url': 'https://github.com/example/soft-nms'
            },
            {
                'name': 'DIoU-NMS',
                'accuracy': 94.5,
                'speed': 2.3,
                'memory': 112.0,
                'date': '2023-01-05',
                'paper_url': 'https://example.com/diou-nms',
                'code_url': 'https://github.com/example/diou-nms'
            }
        ]

    def evaluate(self, model_name, dataset):
        # 예시 평가 결과
        return {
            'accuracy': 95.2,
            'speed': 2.1,
            'memory': 128.5,
            'precision': 0.94,
            'recall': 0.96
        }

    def get_leaderboard(self):
        return self.leaderboard_data 