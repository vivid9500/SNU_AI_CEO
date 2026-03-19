# 텍스트 쿼리 이미지 검색 시스템

사용자가 입력한 텍스트 쿼리와 가장 관련성 높은 이미지를 찾아주는 Python 프로그램입니다.

## 아키텍처

```
이미지 파일 → GPT-4o Vision API → 텍스트 설명 → text-embedding-3-small → 벡터 임베딩
                                                                              ↓
사용자 쿼리 → text-embedding-3-small → 쿼리 벡터 → 코사인 유사도 비교 → 상위 3개 결과
```

### 주요 기술
- **OpenAI GPT-4o Vision API**: 이미지에서 텍스트 설명 자동 생성
- **OpenAI text-embedding-3-small**: 텍스트를 1536차원 벡터로 변환
- **코사인 유사도**: 쿼리 벡터와 이미지 설명 벡터 간 유사도 비교
- **Streamlit**: 웹 기반 사용자 인터페이스

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. API 키 설정

`.env.example` 파일을 `.env`로 복사하고 API 키를 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 키를 설정합니다:

```
OPENAI_API_KEY=sk-your-openai-api-key
UNSPLASH_ACCESS_KEY=your-unsplash-key  # (선택사항)
```

### 3. 실행

```bash
streamlit run app.py
```

브라우저에서 `http://localhost:8501`로 자동으로 열립니다.

## 사용 방법

### 이미지 처리
1. 앱을 실행하면 사이드바에 샘플 이미지 6개가 표시됩니다.
2. **"모든 이미지 처리"** 버튼을 클릭하면:
   - 각 이미지에 대해 Vision API로 설명을 생성하고
   - Embedding API로 벡터 임베딩을 생성합니다.

### 이미지 검색
1. 메인 영역의 검색창에 텍스트 쿼리를 입력합니다.
   - 예: "자연 속 석양", "귀여운 동물", "도시의 밤 풍경"
2. **"검색"** 버튼을 클릭하면 상위 3개의 유사 이미지가 표시됩니다.

### Unsplash에서 이미지 추가 (선택사항)
1. `.env`에 `UNSPLASH_ACCESS_KEY`를 설정합니다.
2. 사이드바의 Unsplash 섹션에서 검색어를 입력합니다.
3. 원하는 이미지를 다운로드한 후, "처리" 버튼으로 임베딩을 생성합니다.

## 프로젝트 구조

```
snu2/
├── app.py              # Streamlit 메인 애플리케이션
├── image_search.py     # 핵심 로직 (Vision API, Embedding, 유사도)
├── unsplash.py         # Unsplash 이미지 다운로드 유틸리티
├── images/             # 이미지 파일 저장소
├── data/
│   └── image_data.json # 이미지 설명 및 임베딩 데이터
├── requirements.txt    # Python 의존성
├── .env.example        # API 키 템플릿
└── README.md           # 이 문서
```

## 예시

**입력 쿼리:** "자연 속 석양"

**출력:** 가장 관련성 높은 이미지 3개가 유사도 점수와 함께 표시됩니다:
1. 🥇 sample_mountain.jpg (눈 덮인 산봉우리) - 유사도 85%
2. 🥈 sample_beach.jpg (열대 해변) - 유사도 78%
3. 🥉 sample_forest.jpg (숲속 오솔길) - 유사도 72%
