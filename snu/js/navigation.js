/* === Slide Navigation System === */
const Navigation = (() => {
    let currentSlide = 1;
    let isScrolling = false;
    const totalSlides = 10;

    const progressFill = document.getElementById('progress-fill');
    const slideCounter = document.getElementById('slide-counter');
    const slides = document.querySelectorAll('.slide');

    function goToSlide(n) {
        if (isScrolling) return;
        const target = Math.max(1, Math.min(n, totalSlides));
        if (target === currentSlide) return;

        isScrolling = true;
        const slideEl = document.getElementById(`slide-${target}`);
        slideEl.scrollIntoView({ behavior: 'smooth' });
        currentSlide = target;
        updateUI();

        // Debounce scroll lock
        setTimeout(() => { isScrolling = false; }, 800);
    }

    function next() { goToSlide(currentSlide + 1); }
    function prev() { goToSlide(currentSlide - 1); }

    function updateUI() {
        const pct = ((currentSlide - 1) / (totalSlides - 1)) * 100;
        progressFill.style.width = `${pct}%`;
        slideCounter.textContent = `${currentSlide} / ${totalSlides}`;

        // Dispatch custom event for other modules
        document.dispatchEvent(new CustomEvent('slidechange', {
            detail: { slide: currentSlide, total: totalSlides }
        }));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Don't capture when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
                e.preventDefault();
                next();
                break;
            case 'ArrowLeft':
            case 'Backspace':
                e.preventDefault();
                prev();
                break;
            case 'ArrowDown':
                e.preventDefault();
                next();
                break;
            case 'ArrowUp':
                e.preventDefault();
                prev();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides);
                break;
        }
    });

    // Button navigation
    document.getElementById('btn-next').addEventListener('click', next);
    document.getElementById('btn-prev').addEventListener('click', prev);

    // IntersectionObserver to sync currentSlide on manual scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const slideNum = parseInt(entry.target.dataset.slide);
                if (slideNum !== currentSlide) {
                    currentSlide = slideNum;
                    updateUI();
                }
            }
        });
    }, { threshold: 0.5 });

    slides.forEach(s => observer.observe(s));

    // Initialize
    updateUI();

    return { goToSlide, next, prev, getCurrentSlide: () => currentSlide };
})();
