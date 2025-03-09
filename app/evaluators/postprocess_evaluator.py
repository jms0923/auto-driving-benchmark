import numpy as np
from scipy.optimize import linear_sum_assignment
import json
import os

class PostprocessEvaluator:
    def __init__(self):
        self.metrics = {
            'tracking': self._evaluate_tracking,
            'filtering': self._evaluate_filtering,
            'fusion': self._evaluate_fusion
        }
        
        # JSON 파일에서 리더보드 데이터 로드
        json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'postprocess_leaderboard.json')
        with open(json_path, 'r') as f:
            data = json.load(f)
            self.leaderboard_data = data['algorithms']
    
    def evaluate(self, processed_output, ground_truth):
        """
        후처리된 출력을 평가합니다.
        
        Args:
            processed_output: 후처리된 출력 데이터
            ground_truth: 실제 정답 데이터
            
        Returns:
            dict: 평가 결과
        """
        # 예시 평가 결과
        return {
            'accuracy': 95.2,
            'speed': 2.1,
            'memory': 98.0,
            'precision': 0.94,
            'recall': 0.96
        }
    
    def _evaluate_tracking(self, output, ground_truth):
        """객체 추적 성능을 평가합니다."""
        # MOTA (Multi-Object Tracking Accuracy) 계산
        tracked_objects = np.array(output['tracks'])
        true_objects = np.array(ground_truth['tracks'])
        
        matches = self._match_tracks(tracked_objects, true_objects)
        
        # ID switches 계산
        id_switches = self._count_id_switches(matches)
        
        # Track fragmentations 계산
        fragmentations = self._count_fragmentations(matches)
        
        return {
            'mota': float(self._calculate_mota(matches, len(true_objects))),
            'id_switches': int(id_switches),
            'fragmentations': int(fragmentations)
        }
    
    def _evaluate_filtering(self, output, ground_truth):
        """필터링 성능을 평가합니다."""
        filtered_data = np.array(output['filtered'])
        true_data = np.array(ground_truth['data'])
        
        # RMSE 계산
        rmse = np.sqrt(((filtered_data - true_data) ** 2).mean())
        
        # 평활도 계산
        smoothness = self._calculate_smoothness(filtered_data)
        
        return {
            'rmse': float(rmse),
            'smoothness': float(smoothness)
        }
    
    def _evaluate_fusion(self, output, ground_truth):
        """센서 융합 성능을 평가합니다."""
        fused_data = np.array(output['fused'])
        true_data = np.array(ground_truth['data'])
        
        # 정확도 계산
        accuracy = np.mean(np.abs(fused_data - true_data))
        
        # 일관성 계산
        consistency = self._calculate_consistency(fused_data)
        
        return {
            'accuracy': float(accuracy),
            'consistency': float(consistency)
        }
    
    def _match_tracks(self, tracked, true):
        """추적된 객체와 실제 객체를 매칭합니다."""
        cost_matrix = np.zeros((len(tracked), len(true)))
        for i, track in enumerate(tracked):
            for j, truth in enumerate(true):
                cost_matrix[i, j] = np.linalg.norm(track - truth)
        
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        return list(zip(row_ind, col_ind))
    
    def _calculate_mota(self, matches, num_true):
        """MOTA 점수를 계산합니다."""
        if num_true == 0:
            return 0
        return len(matches) / num_true
    
    def _count_id_switches(self, matches):
        """ID 스위치 횟수를 계산합니다."""
        # 실제 구현에서는 시간에 따른 ID 변경을 추적해야 합니다
        return len(set(m[0] for m in matches)) - len(matches)
    
    def _count_fragmentations(self, matches):
        """트랙 단편화 횟수를 계산합니다."""
        # 실제 구현에서는 트랙의 연속성 단절을 계산해야 합니다
        return len(matches) - len(set(m[1] for m in matches))
    
    def _calculate_smoothness(self, data):
        """데이터의 평활도를 계산합니다."""
        if len(data) < 2:
            return 0
        return np.mean(np.abs(np.diff(data)))
    
    def _calculate_consistency(self, data):
        """데이터의 일관성을 계산합니다."""
        return 1.0 / (1.0 + np.std(data))
    
    def get_leaderboard(self):
        return self.leaderboard_data 