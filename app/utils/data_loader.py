class DataLoader:
    def __init__(self):
        pass
        
    def list_datasets(self):
        """
        사용 가능한 데이터셋 목록을 반환합니다.
        
        Returns:
            list: 데이터셋 목록
        """
        # 임시 데이터셋 목록 반환
        return [
            {
                'name': 'COCO 2017',
                'type': 'detection',
                'size': 123287,
                'classes': 80
            },
            {
                'name': 'Pascal VOC',
                'type': 'detection',
                'size': 21503,
                'classes': 20
            }
        ] 