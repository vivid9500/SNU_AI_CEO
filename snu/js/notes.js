/* === Presenter Notes Module === */
const Notes = (() => {
    const panel = document.getElementById('presenter-notes');
    const content = document.getElementById('notes-content');
    const closeBtn = document.getElementById('notes-close');
    let isVisible = false;

    // Notes content per slide
    const notesData = {
        1: `안녕하십니까. 서울대학교 AI 빅데이터 CEO 과정 최종 발표를 시작하겠습니다.<br><br>
            오늘 발표할 주제는 <strong>"End-to-End AI B2B SCM 시스템"</strong>입니다.<br>
            남도마켓의 도소매 공급망 전체를 AI로 혁신하는 프로젝트에 대해 말씀드리겠습니다.`,

        2: `현재 데이터를 보면, 상품 등록수와 거래확정금액의 상관계수가 <strong>0.81</strong>로 매우 높습니다.<br><br>
            이는 상품 등록을 늘리면 매출이 올라간다는 것이 데이터로 검증되었다는 의미입니다.<br>
            소매 VoC(고객의 목소리)에서도 남도마켓 내 <strong>상품 수 부족</strong>이 지속적으로 제기되고 있습니다.<br><br>
            따라서 도매의 상품 등록을 늘리기 위한 프로젝트가 반드시 필요합니다.`,

        3: `문제의 근본 원인을 파고들어 보겠습니다.<br><br>
            단순히 상품 등록 단계만의 문제가 아닙니다. 연령대가 높은 도매상들은 상품명, 카테고리, 소재, 색상 등을 채우기 어려워합니다.<br>
            더 앞 단계를 보면, POS 시스템의 HW/SW 공급률이 60%에 불과하고 매우 오래된 소프트웨어가 사용되고 있습니다.<br>
            그리고 가장 앞 단계인 기획/생산에서도 어떤 상품을 얼마나 만들어야 할지 많은 어려움을 겪고 있습니다.<br><br>
            <strong>결론:</strong> 기획/생산부터 상품 등록까지 전체 파이프라인을 일체화해야 합니다.`,

        4: `경쟁사인 신상마켓은 4단계 중 <strong>마지막 단계인 상품 노출/홍보</strong>에만 AI를 적용하고 있습니다.<br><br>
            반면 우리 남도마켓은 이미 AI 임베딩, BM25, RAG, Thesaurus를 결합한 검색/추천 엔진을 개발하여 적용하였습니다.<br>
            따라서 <strong>앞단 3개 단계</strong>(기획/생산, 재고관리, 상품등록)에서 명확히 포지셔닝할 수 있다면 경쟁사를 앞설 수 있다고 판단합니다.<br><br>
            "경쟁사가 진열대만 꾸밀 때, 남도마켓은 공장과 창고에서부터 AI를 연결합니다."`,

        5: `실행 방안은 두 트랙으로 나뉩니다.<br><br>
            <strong>Track 1: AI 자동화 POS</strong> - 기존 도매를 위한 것으로, 바이브코딩으로 POS 시스템을 구축합니다. 재고 등록 시 자동으로 상품 등록 AI가 작동되어 남도마켓에 노출됩니다.<br>
            <strong>Track 2: AI 상품 등록 (Shadow Registration)</strong> - 신규 도매를 위한 것으로, 가입 없이도 AI로 상품 정보를 채워 등록하면 남도마켓에 노출됩니다. 판매가 되면 그때 가입하여 주문을 처리하는 프로세스입니다.<br><br>
            핵심 전략: <strong>가입 장벽을 없애고 '첫 판매 경험'을 미끼로 플랫폼에 락인</strong>합니다.`,

        6: `도입할 AI 기술은 크게 세 가지입니다.<br><br>
            <strong>첫째, Vision AI</strong> - OpenAI API, Claude API의 Vision 기능을 활용하여 상품 이미지를 인식하고, 상품 정보를 자동으로 인덱싱합니다.<br>
            <strong>둘째, Gen AI(LLM)</strong> - 인덱싱된 상품 정보를 기반으로 상품명과 상품 설명을 자동 생성합니다.<br>
            <strong>셋째, GraphRAG</strong> - 사내 도소매 데이터를 소매상, 검색어, 상품, 구매 관계로 구성된 지식 그래프로 구축합니다.<br>
            이를 통해 소매상의 검색 패턴과 도매상의 신상품 간 연관성을 추론하여 생산 기획을 가이드합니다.`,

        7: `경제적 기대 효과는 세 가지 측면에서 봐야 합니다.<br><br>
            <strong>공급자(도매) 측면:</strong> 상품 등록 리소스가 절감되고, 데이터 기반 생산 기획으로 악성 재고가 감소합니다. 도매상 입장에서 "재고관리만 했을 뿐인데 남도마켓에 알아서 올라간다"는 경험을 하게 됩니다.<br>
            <strong>플랫폼 측면:</strong> 신규 도매상 획득 비용(CAC)이 획기적으로 감소하고, 등록 상품 수 증가에 따라 거래액(GMV)이 동반 상승합니다.<br>
            <strong>데이터 자산화:</strong> 가장 중요한 것은 도매 시장의 '기획/생산 데이터'라는 대체 불가능한 독점적 데이터를 확보하는 것입니다.`,

        8: `3개년 실행 계획입니다.<br><br>
            <strong>1차년도 (Speed & Lock-in):</strong> 바이브코딩으로 기존 1년 걸리던 시스템 구축을 수개월로 압축합니다. 상반기에 AI POS MVP와 Shadow Registration을 오픈하고, 하반기에 자사 신규 의류 브랜드로 첫 PoC를 진행합니다.<br>
            <strong>2차년도 (Intelligence & Optimization):</strong> 누적 데이터로 GraphRAG 지식 그래프를 구축하고, 도매상 맞춤형 생산 기획 추천 대시보드를 런칭합니다.<br>
            <strong>3차년도 (Ecosystem & Scale):</strong> All-in-one Dashboard로 도매상의 필수 비즈니스 OS로 자리매김하고, 광저우 등 해외 소싱 거점과 연결하는 Cross-border SCM 망으로 확장합니다.`,

        9: `팀 구성입니다.<br><br>
            <strong>물류팀, 세일즈팀, 마케팅팀</strong>은 현장에 나가 현황과 요구사항 파악에 집중합니다.<br>
            <strong>개발팀</strong>은 전체에 바이브코딩을 도입하고, '버전별 개발 5일 상한제'를 두어 개발 속도를 높이고 현장 요구를 신속하게 반영합니다.<br>
            <strong>CPO</strong>는 이 전 과정에서 실제 현장의 문제를 파악하고, 이번 과정에서 학습한 LLM/RAG/프롬프트 엔지니어링/바이브코딩 등의 AI 지식으로 개발팀과 조율합니다.`,

        10: `감사합니다. 질문이 있으시면 말씀해 주세요.`
    };

    function toggle() {
        isVisible = !isVisible;
        panel.classList.toggle('visible', isVisible);
    }

    function show() {
        isVisible = true;
        panel.classList.add('visible');
    }

    function hide() {
        isVisible = false;
        panel.classList.remove('visible');
    }

    function updateNotes(slideNum) {
        content.innerHTML = notesData[slideNum] || '';
    }

    // Keyboard toggle (N key)
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'n' || e.key === 'N') {
            toggle();
        }
    });

    // Button toggles
    document.getElementById('btn-notes').addEventListener('click', toggle);
    closeBtn.addEventListener('click', hide);

    // Listen for slide changes
    document.addEventListener('slidechange', (e) => {
        updateNotes(e.detail.slide);
    });

    // Initialize with first slide notes
    updateNotes(1);

    return { toggle, show, hide };
})();
