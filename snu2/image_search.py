"""
이미지 검색 핵심 로직
- OpenAI Vision API로 이미지 설명 생성
- OpenAI Embedding API로 벡터 임베딩 변환
- 코사인 유사도 기반 이미지 검색
"""

import os
import json
import base64
from pathlib import Path

import numpy as np
from openai import OpenAI
from PIL import Image

# 경로 설정
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "image_data.json"
IMAGES_DIR = BASE_DIR / "images"

# 모델 설정
EMBEDDING_MODEL = "text-embedding-3-small"
VISION_MODEL = "gpt-4o"

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


# ── 데이터 영속성 ──

def load_image_data() -> dict:
    """image_data.json을 로드합니다."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        save_image_data({})
        return {}
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def save_image_data(data: dict) -> None:
    """image_data.json에 저장합니다."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ── 이미지 등록 ──

def scan_images_directory() -> list[str]:
    """images/ 폴더를 스캔하고 새 이미지를 자동 등록합니다."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    data = load_image_data()
    filenames = []

    for file in sorted(IMAGES_DIR.iterdir()):
        if file.suffix.lower() in SUPPORTED_EXTENSIONS:
            filenames.append(file.name)
            if file.name not in data:
                data[file.name] = {
                    "path": f"images/{file.name}",
                    "description": None,
                    "embedding": None,
                    "source": "unknown",
                    "processed": False,
                }

    save_image_data(data)
    return filenames


def register_image(filename: str, source: str = "sample") -> dict:
    """새 이미지를 데이터 저장소에 등록합니다."""
    data = load_image_data()
    entry = {
        "path": f"images/{filename}",
        "description": None,
        "embedding": None,
        "source": source,
        "processed": False,
    }
    data[filename] = entry
    save_image_data(data)
    return entry


# ── Vision API ──

def encode_image_to_base64(image_path: str) -> str:
    """이미지를 base64로 인코딩합니다. 1024px 이상이면 리사이즈합니다."""
    full_path = BASE_DIR / image_path
    img = Image.open(full_path)

    # 큰 이미지는 리사이즈하여 API 비용 절감
    max_width = 1024
    if img.width > max_width:
        ratio = max_width / img.width
        new_size = (max_width, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # RGB로 변환 (RGBA 등 처리)
    if img.mode != "RGB":
        img = img.convert("RGB")

    import io
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def generate_description(image_path: str, client: OpenAI) -> str:
    """GPT-4o Vision API로 이미지 설명을 생성합니다."""
    base64_image = encode_image_to_base64(image_path)

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "당신은 이미지를 상세하게 설명하는 전문가입니다. "
                    "이미지의 주요 대상, 배경, 색상, 분위기, 주목할 만한 세부사항을 "
                    "포함하여 2-3문장으로 한국어로 설명해주세요."
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "이 이미지를 상세하게 설명해주세요."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                            "detail": "low",
                        },
                    },
                ],
            },
        ],
        max_tokens=300,
    )

    return response.choices[0].message.content.strip()


# ── Embedding API ──

def generate_embedding(text: str, client: OpenAI) -> list[float]:
    """텍스트를 벡터 임베딩으로 변환합니다."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


# ── 유사도 계산 ──

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """두 벡터 간의 코사인 유사도를 계산합니다."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(dot / norm)


# ── 이미지 처리 ──

def process_image(filename: str, client: OpenAI) -> dict:
    """단일 이미지를 처리합니다 (설명 생성 + 임베딩 생성)."""
    data = load_image_data()
    entry = data.get(filename)
    if not entry:
        raise ValueError(f"이미지 '{filename}'이 등록되어 있지 않습니다.")

    image_path = entry["path"]

    # 설명이 없으면 Vision API로 생성
    if not entry.get("description"):
        entry["description"] = generate_description(image_path, client)

    # 임베딩 생성
    entry["embedding"] = generate_embedding(entry["description"], client)
    entry["processed"] = True

    data[filename] = entry
    save_image_data(data)
    return entry


def process_all_unprocessed(client: OpenAI, progress_callback=None) -> int:
    """처리되지 않은 모든 이미지를 일괄 처리합니다."""
    data = load_image_data()
    unprocessed = [
        name for name, entry in data.items()
        if not entry.get("processed") or not entry.get("embedding")
    ]

    total = len(unprocessed)
    for i, filename in enumerate(unprocessed):
        process_image(filename, client)
        if progress_callback:
            progress_callback(i + 1, total)

    return total


# ── 검색 ──

def search_images(query: str, client: OpenAI, top_k: int = 3) -> list[dict]:
    """텍스트 쿼리로 가장 유사한 이미지를 검색합니다."""
    query_embedding = generate_embedding(query, client)
    data = load_image_data()

    results = []
    for filename, entry in data.items():
        if not entry.get("processed") or not entry.get("embedding"):
            continue
        similarity = cosine_similarity(query_embedding, entry["embedding"])
        results.append({
            "filename": filename,
            "path": entry["path"],
            "description": entry["description"],
            "similarity": similarity,
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]
