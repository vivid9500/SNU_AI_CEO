"""
Unsplash 이미지 검색 및 다운로드 유틸리티
"""

import os
from pathlib import Path

import requests

IMAGES_DIR = Path(__file__).parent / "images"


def search_unsplash(query: str, count: int = 6) -> list[dict]:
    """Unsplash API로 이미지를 검색합니다.

    UNSPLASH_ACCESS_KEY 환경변수가 필요합니다.
    반환: [{"id", "thumb_url", "regular_url", "description", "photographer"}, ...]
    """
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise ValueError(
            "UNSPLASH_ACCESS_KEY 환경변수가 설정되지 않았습니다. "
            ".env 파일에 Unsplash API 키를 추가해주세요."
        )

    response = requests.get(
        "https://api.unsplash.com/search/photos",
        params={
            "query": query,
            "per_page": count,
            "orientation": "landscape",
        },
        headers={"Authorization": f"Client-ID {access_key}"},
        timeout=10,
    )
    response.raise_for_status()

    results = []
    for photo in response.json().get("results", []):
        results.append({
            "id": photo["id"],
            "thumb_url": photo["urls"]["thumb"],
            "regular_url": photo["urls"]["regular"],
            "description": photo.get("alt_description") or photo.get("description") or "",
            "photographer": photo.get("user", {}).get("name", "Unknown"),
        })

    return results


def download_image(url: str, filename: str) -> str:
    """URL에서 이미지를 다운로드하여 images/ 폴더에 저장합니다."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    filepath = IMAGES_DIR / filename

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    with open(filepath, "wb") as f:
        f.write(response.content)

    return str(filepath)
