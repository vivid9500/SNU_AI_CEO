"""
텍스트 쿼리 이미지 검색 - Streamlit 웹 애플리케이션
"""

import os
from typing import Optional

import streamlit as st
from pathlib import Path
from PIL import Image
from openai import OpenAI
from dotenv import load_dotenv

from image_search import (
    load_image_data,
    save_image_data,
    scan_images_directory,
    process_image,
    process_all_unprocessed,
    search_images,
    IMAGES_DIR,
    BASE_DIR,
)

load_dotenv()

# ── 페이지 설정 ──
st.set_page_config(
    page_title="텍스트 쿼리 이미지 검색",
    page_icon="🔍",
    layout="wide",
)


def get_openai_client() -> Optional[OpenAI]:
    """OpenAI 클라이언트를 초기화합니다. (.env 또는 Streamlit Secrets 지원)"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        api_key = st.secrets.get("OPENAI_API_KEY") if hasattr(st, "secrets") else None
    if not api_key:
        return None
    return OpenAI(api_key=api_key)


def render_sidebar(client: Optional[OpenAI]):
    """사이드바를 렌더링합니다."""
    with st.sidebar:
        st.header("설정")

        # API 상태 표시
        if client:
            st.success("OpenAI API 연결됨")
        else:
            st.error("OpenAI API 키가 없습니다. `.env` 파일에 OPENAI_API_KEY를 설정해주세요.")
            return

        st.divider()

        # ── 이미지 관리 ──
        st.header("이미지 관리")

        # 이미지 스캔
        filenames = scan_images_directory()
        data = load_image_data()

        total = len(filenames)
        processed = sum(1 for f in filenames if data.get(f, {}).get("processed"))
        st.caption(f"전체 {total}개 이미지 | {processed}개 처리 완료")

        # 일괄 처리 버튼
        if total > processed:
            if st.button("모든 이미지 처리", type="primary", use_container_width=True):
                progress_bar = st.progress(0)
                status_text = st.empty()

                def on_progress(current, total_count):
                    progress_bar.progress(current / total_count)
                    status_text.text(f"처리 중... ({current}/{total_count})")

                try:
                    count = process_all_unprocessed(client, progress_callback=on_progress)
                    status_text.text(f"{count}개 이미지 처리 완료!")
                    st.rerun()
                except Exception as e:
                    st.error(f"처리 중 오류: {e}")

        # 이미지 갤러리
        if filenames:
            cols = st.columns(2)
            for i, filename in enumerate(filenames):
                with cols[i % 2]:
                    img_path = IMAGES_DIR / filename
                    if img_path.exists():
                        st.image(str(img_path), caption=filename, use_container_width=True)
                        entry = data.get(filename, {})
                        if entry.get("processed"):
                            st.caption("✅ 처리 완료")
                        else:
                            if st.button(f"처리", key=f"proc_{filename}"):
                                try:
                                    with st.spinner("처리 중..."):
                                        process_image(filename, client)
                                    st.rerun()
                                except Exception as e:
                                    st.error(str(e))

        st.divider()

        # ── Unsplash 검색 ──
        st.header("Unsplash에서 추가")

        unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
        if not unsplash_key:
            st.info(
                "Unsplash API 키가 없습니다.\n\n"
                "`.env` 파일에 `UNSPLASH_ACCESS_KEY`를 추가하면 "
                "Unsplash에서 이미지를 검색하고 다운로드할 수 있습니다."
            )
            st.caption("또는 `images/` 폴더에 직접 이미지를 추가하세요.")
        else:
            unsplash_query = st.text_input("Unsplash 검색어", placeholder="예: sunset, cat, city...")
            if st.button("검색", key="unsplash_search") and unsplash_query:
                try:
                    from unsplash import search_unsplash
                    results = search_unsplash(unsplash_query)
                    st.session_state.unsplash_results = results
                except Exception as e:
                    st.error(f"검색 오류: {e}")

            # Unsplash 검색 결과 표시
            if "unsplash_results" in st.session_state and st.session_state.unsplash_results:
                results = st.session_state.unsplash_results
                for result in results:
                    st.image(result["thumb_url"], caption=result["description"][:50] or "이미지")
                    st.caption(f"📷 {result['photographer']}")
                    if st.button("다운로드", key=f"dl_{result['id']}"):
                        try:
                            from unsplash import download_image
                            from image_search import register_image
                            filename = f"unsplash_{result['id']}.jpg"
                            download_image(result["regular_url"], filename)
                            register_image(filename, source="unsplash")
                            st.success(f"'{filename}' 다운로드 완료!")
                            st.rerun()
                        except Exception as e:
                            st.error(f"다운로드 오류: {e}")


def render_main(client: Optional[OpenAI]):
    """메인 영역을 렌더링합니다."""
    st.title("🔍 텍스트 쿼리 이미지 검색")
    st.markdown(
        "자연어 텍스트를 입력하면, OpenAI 임베딩 기반 유사도 분석을 통해 "
        "가장 관련성 높은 이미지를 찾아드립니다."
    )

    if not client:
        st.warning("사이드바에서 API 키 설정 안내를 확인해주세요.")
        return

    # 처리된 이미지 수 확인
    data = load_image_data()
    processed_count = sum(1 for entry in data.values() if entry.get("processed"))

    if processed_count == 0:
        st.info(
            "아직 처리된 이미지가 없습니다. "
            "사이드바에서 '모든 이미지 처리' 버튼을 클릭하여 이미지를 처리해주세요."
        )
        return

    # ── 검색 영역 ──
    col_input, col_button = st.columns([5, 1])
    with col_input:
        query = st.text_input(
            "검색 쿼리",
            placeholder="찾고 싶은 이미지를 설명해주세요. 예: 자연 속 석양, 귀여운 동물...",
            label_visibility="collapsed",
        )
    with col_button:
        search_clicked = st.button("검색", type="primary", use_container_width=True)

    # Enter 키 또는 검색 버튼으로 검색
    if (search_clicked or query) and query.strip():
        if query != st.session_state.get("last_query", ""):
            with st.spinner("검색 중..."):
                try:
                    results = search_images(query.strip(), client, top_k=3)
                    st.session_state.search_results = results
                    st.session_state.last_query = query
                except Exception as e:
                    st.error(f"검색 오류: {e}")
                    return

    # ── 결과 표시 ──
    if "search_results" in st.session_state and st.session_state.search_results:
        results = st.session_state.search_results
        st.markdown("---")
        st.subheader("검색 결과")
        st.caption(f"쿼리: \"{st.session_state.get('last_query', '')}\"")

        cols = st.columns(len(results))
        for i, result in enumerate(results):
            with cols[i]:
                # 순위 표시
                medal = ["🥇", "🥈", "🥉"][i] if i < 3 else f"#{i+1}"
                st.markdown(f"### {medal} {i+1}위")

                # 이미지 표시
                img_path = BASE_DIR / result["path"]
                if img_path.exists():
                    st.image(str(img_path), use_container_width=True)

                # 유사도 점수
                score = result["similarity"]
                st.metric("유사도", f"{score:.1%}")
                st.progress(min(score, 1.0))

                # 파일명 및 설명
                st.caption(f"📁 {result['filename']}")
                with st.expander("이미지 설명"):
                    st.write(result["description"])
    elif "last_query" in st.session_state:
        st.info("검색 결과가 없습니다.")


def main():
    client = get_openai_client()
    render_sidebar(client)
    render_main(client)


if __name__ == "__main__":
    main()
