class ModelEvaluator:
    def __init__(self):
        # 예시 데이터
        self.leaderboard_data = [
            {
                'name': 'YOLOv8-l',
                'map': 52.9,
                'fps': 98.0,
                'input_size': '640x640',
                'date': '2023-01-10',
                'paper_url': 'https://example.com/yolov8',
                'code_url': 'https://github.com/ultralytics/ultralytics'
            },
            {
                'name': 'YOLOv7-x',
                'map': 51.2,
                'fps': 114.0,
                'input_size': '640x640',
                'date': '2022-07-06',
                'paper_url': 'https://example.com/yolov7',
                'code_url': 'https://github.com/WongKinYiu/yolov7'
            },
            {
                'name': 'DAMO-YOLO',
                'map': 50.0,
                'fps': 123.0,
                'input_size': '640x640',
                'date': '2022-12-15',
                'paper_url': 'https://example.com/damo-yolo',
                'code_url': 'https://github.com/tinyvision/DAMO-YOLO'
            }
        ]

    def evaluate(self, model_name, dataset):
        # 예시 평가 결과
        return {
            'map': 52.9,
            'fps': 98.0,
            'precision': 0.86,
            'recall': 0.83,
            'f1_score': 0.845
        }

    def get_leaderboard(self):
        return self.leaderboard_data 