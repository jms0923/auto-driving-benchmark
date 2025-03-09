# Autonomous Driving Benchmark Platform

자율주행 AI 모델 및 후처리 평가를 위한 벤치마크 플랫폼입니다.

## 주요 기능

1. AI 모델 평가
   - 객체 검출 성능 평가
   - 세그멘테이션 성능 평가
   - 깊이 추정 성능 평가

2. 후처리 평가
   - 객체 추적 성능 평가
   - 필터링 및 보정 알고리즘 평가
   - 융합 알고리즘 평가

## 설치 방법

```bash
pip install -r requirements.txt
```

## 실행 방법

```bash
python app.py
```

## 프로젝트 구조

```
ad_bench/
├── app/
│   ├── static/
│   ├── templates/
│   ├── models/
│   ├── evaluators/
│   └── utils/
├── config/
├── tests/
└── data/
``` 