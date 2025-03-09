import numpy as np
from sklearn.metrics import precision_recall_curve, average_precision_score

class ModelEvaluator:
    def __init__(self):
        self.metrics = {
            'detection': self._evaluate_detection,
            'segmentation': self._evaluate_segmentation,
            'depth': self._evaluate_depth
        }
        # 실제 객체 탐지 모델 데이터
        self.leaderboard_data = [
            {
                'name': 'YOLOv8x',
                'map': 53.9,
                'fps': 87.0,
                'input_size': '640x640',
                'date': '2023-01-10',
                'paper_url': 'https://arxiv.org/abs/2301.10401',
                'code_url': 'https://github.com/ultralytics/ultralytics',
                'abstract': 'YOLOv8 is the latest version of YOLO by Ultralytics. It introduces significant improvements in both architecture and training methodology. The model achieves state-of-the-art results in object detection while maintaining real-time inference speeds. Key innovations include a more efficient backbone, enhanced feature pyramid network, and advanced loss functions for better accuracy.',
                'image_url': '/static/images/yolov8.png'
            },
            {
                'name': 'RT-DETR-L',
                'map': 53.0,
                'fps': 114.0,
                'input_size': '640x640',
                'date': '2023-04-17',
                'paper_url': 'https://arxiv.org/abs/2304.08069',
                'code_url': 'https://github.com/PaddlePaddle/PaddleDetection',
                'abstract': 'RT-DETR (Real-Time DEtection TRansformer) is a novel efficient vision transformer for real-time object detection. It achieves an excellent speed-accuracy trade-off without sacrificing the simplicity of the DETR framework. The model introduces IoU-aware query selection and feature pyramid network for enhanced performance.',
                'image_url': '/static/images/rt-detr.png'
            },
            {
                'name': 'YOLOv7-X',
                'map': 52.8,
                'fps': 114.0,
                'input_size': '640x640',
                'date': '2022-07-06',
                'paper_url': 'https://arxiv.org/abs/2207.02696',
                'code_url': 'https://github.com/WongKinYiu/yolov7',
                'abstract': 'YOLOv7 extends the YOLO series of real-time object detectors by proposing numerous architectural advances. It introduces extended and compound scaling methods, auxiliary head training, and dynamic label assignment. The model achieves state-of-the-art results while maintaining real-time inference capabilities.',
                'image_url': '/static/images/yolov7.png'
            },
            {
                'name': 'DAMO-YOLO',
                'map': 51.9,
                'fps': 123.0,
                'input_size': '640x640',
                'date': '2022-12-15',
                'paper_url': 'https://arxiv.org/abs/2211.15444',
                'code_url': 'https://github.com/tinyvision/DAMO-YOLO',
                'abstract': 'DAMO-YOLO is a fast and accurate object detection method that inherits the advantages of both YOLO and transformer-based detectors. It introduces neural architecture search for optimal model design and a unified label assignment strategy. The model achieves excellent performance while maintaining high inference speed.',
                'image_url': '/static/images/damo-yolo.png'
            },
            {
                'name': 'YOLOv6-L',
                'map': 51.7,
                'fps': 121.0,
                'input_size': '640x640',
                'date': '2022-09-06',
                'paper_url': 'https://arxiv.org/abs/2209.02976',
                'code_url': 'https://github.com/meituan/YOLOv6'
            },
            {
                'name': 'PP-YOLOE+',
                'map': 51.4,
                'fps': 123.0,
                'input_size': '640x640',
                'date': '2022-08-23',
                'paper_url': 'https://arxiv.org/abs/2203.16250',
                'code_url': 'https://github.com/PaddlePaddle/PaddleDetection'
            },
            {
                'name': 'YOLOX-X',
                'map': 51.1,
                'fps': 99.0,
                'input_size': '640x640',
                'date': '2021-07-18',
                'paper_url': 'https://arxiv.org/abs/2107.08430',
                'code_url': 'https://github.com/Megvii-BaseDetection/YOLOX'
            },
            {
                'name': 'YOLOv5x',
                'map': 50.7,
                'fps': 98.0,
                'input_size': '640x640',
                'date': '2021-06-05',
                'paper_url': 'https://arxiv.org/abs/2104.13634',
                'code_url': 'https://github.com/ultralytics/yolov5'
            }
        ]
    
    def evaluate(self, model_output, ground_truth):
        """
        모델 출력을 평가합니다.
        
        Args:
            model_output: 모델의 출력
            ground_truth: 실제 정답 데이터
            
        Returns:
            dict: 평가 결과
        """
        # 예시 평가 결과
        return {
            'map': 52.9,
            'fps': 98.0,
            'precision': 0.86,
            'recall': 0.83,
            'f1_score': 0.845
        }
    
    def _evaluate_detection(self, output, ground_truth):
        """객체 검출 성능을 평가합니다."""
        predictions = np.array(output['boxes'])
        true_boxes = np.array(ground_truth['boxes'])
        
        # IoU 계산
        ious = self._calculate_iou(predictions, true_boxes)
        
        # AP 계산
        ap = average_precision_score(ground_truth['labels'], output['scores'])
        
        return {
            'average_precision': float(ap),
            'mean_iou': float(np.mean(ious))
        }
    
    def _evaluate_segmentation(self, output, ground_truth):
        """세그멘테이션 성능을 평가합니다."""
        pred_mask = np.array(output['mask'])
        true_mask = np.array(ground_truth['mask'])
        
        # IoU 계산
        intersection = np.logical_and(pred_mask, true_mask).sum()
        union = np.logical_or(pred_mask, true_mask).sum()
        iou = intersection / union if union > 0 else 0
        
        # Pixel Accuracy 계산
        accuracy = (pred_mask == true_mask).mean()
        
        return {
            'iou': float(iou),
            'pixel_accuracy': float(accuracy)
        }
    
    def _evaluate_depth(self, output, ground_truth):
        """깊이 추정 성능을 평가합니다."""
        pred_depth = np.array(output['depth'])
        true_depth = np.array(ground_truth['depth'])
        
        # RMSE 계산
        rmse = np.sqrt(((pred_depth - true_depth) ** 2).mean())
        
        # MAE 계산
        mae = np.abs(pred_depth - true_depth).mean()
        
        return {
            'rmse': float(rmse),
            'mae': float(mae)
        }
    
    def _calculate_iou(self, box1, box2):
        """두 박스 간의 IoU를 계산합니다."""
        x1 = np.maximum(box1[:, 0], box2[:, 0])
        y1 = np.maximum(box1[:, 1], box2[:, 1])
        x2 = np.minimum(box1[:, 2], box2[:, 2])
        y2 = np.minimum(box1[:, 3], box2[:, 3])
        
        intersection = np.maximum(0, x2 - x1) * np.maximum(0, y2 - y1)
        box1_area = (box1[:, 2] - box1[:, 0]) * (box1[:, 3] - box1[:, 1])
        box2_area = (box2[:, 2] - box2[:, 0]) * (box2[:, 3] - box2[:, 1])
        
        union = box1_area + box2_area - intersection
        return intersection / union

    def get_leaderboard(self):
        return self.leaderboard_data 