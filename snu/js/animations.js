/* === Animation Triggers via IntersectionObserver === */
const Animations = (() => {
    const animatedElements = document.querySelectorAll(
        '.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-grow, .anim-grow-y, .anim-pulse'
    );

    // Main animation observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Remove to re-animate when revisiting slide
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -5% 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // Animated counter for the 0.81 correlation stat
    function animateCounters() {
        document.querySelectorAll('.counter').forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const duration = 2000;
            let started = false;

            const cObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !started) {
                    started = true;
                    const start = performance.now();

                    function update(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        counter.textContent = (target * eased).toFixed(2);
                        if (progress < 1) {
                            requestAnimationFrame(update);
                        }
                    }

                    requestAnimationFrame(update);
                }

                if (!entries[0].isIntersecting) {
                    started = false;
                    counter.textContent = '0.00';
                }
            }, { threshold: 0.5 });

            cObserver.observe(counter);
        });
    }

    animateCounters();

    return {};
})();
