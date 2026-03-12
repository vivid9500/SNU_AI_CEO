/* === SVG Diagram Builders === */
const Diagrams = (() => {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function createSVG(container, width, height) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.overflow = 'visible';
        container.appendChild(svg);
        return svg;
    }

    function createNode(svg, cx, cy, r, fill, stroke, label, sublabel) {
        const g = document.createElementNS(SVG_NS, 'g');
        g.style.opacity = '0';
        g.style.transition = 'opacity 0.5s ease';

        // Glow circle
        const glow = document.createElementNS(SVG_NS, 'circle');
        glow.setAttribute('cx', cx);
        glow.setAttribute('cy', cy);
        glow.setAttribute('r', r + 8);
        glow.setAttribute('fill', fill);
        glow.setAttribute('opacity', '0.15');
        g.appendChild(glow);

        // Main circle
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fill);
        circle.setAttribute('stroke', stroke);
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('opacity', '0.9');
        g.appendChild(circle);

        // Label text
        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', cx);
        text.setAttribute('y', sublabel ? cy - 4 : cy + 1);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-size', '13');
        text.setAttribute('font-weight', '600');
        text.setAttribute('font-family', "'Pretendard', sans-serif");
        text.textContent = label;
        g.appendChild(text);

        if (sublabel) {
            const sub = document.createElementNS(SVG_NS, 'text');
            sub.setAttribute('x', cx);
            sub.setAttribute('y', cy + 14);
            sub.setAttribute('text-anchor', 'middle');
            sub.setAttribute('dominant-baseline', 'middle');
            sub.setAttribute('fill', '#a0a0b8');
            sub.setAttribute('font-size', '10');
            sub.setAttribute('font-family', "'Pretendard', sans-serif");
            sub.textContent = sublabel;
            g.appendChild(sub);
        }

        svg.appendChild(g);
        return g;
    }

    function createEdge(svg, x1, y1, x2, y2, color, label, dashed) {
        const g = document.createElementNS(SVG_NS, 'g');

        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.6');

        if (dashed) {
            line.setAttribute('stroke-dasharray', '6,4');
        }

        // Animation: draw line
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        line.setAttribute('stroke-dasharray', `${length}`);
        line.setAttribute('stroke-dashoffset', `${length}`);
        line.style.transition = 'stroke-dashoffset 1s ease';

        g.appendChild(line);

        if (label) {
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            const bg = document.createElementNS(SVG_NS, 'rect');
            bg.setAttribute('x', mx - 20);
            bg.setAttribute('y', my - 10);
            bg.setAttribute('width', '40');
            bg.setAttribute('height', '20');
            bg.setAttribute('rx', '4');
            bg.setAttribute('fill', 'rgba(10, 10, 15, 0.9)');
            bg.setAttribute('stroke', color);
            bg.setAttribute('stroke-width', '1');
            bg.setAttribute('opacity', '0.8');
            g.appendChild(bg);

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', mx);
            text.setAttribute('y', my + 1);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', '600');
            text.setAttribute('font-family', "'Pretendard', sans-serif");
            text.textContent = label;
            g.appendChild(text);
        }

        svg.appendChild(g);
        return { group: g, line };
    }

    // === GraphRAG Visualization (Slide 5) ===
    function buildGraphRAG() {
        const container = document.getElementById('graphrag-viz');
        if (!container) return;

        const svg = createSVG(container, 800, 280);

        // Define nodes
        const nodes = [
            { label: '소매상 A', sub: 'Node', cx: 100, cy: 80, r: 35, fill: 'rgba(74, 158, 255, 0.3)', stroke: '#4a9eff' },
            { label: '소매상 B', sub: 'Node', cx: 100, cy: 200, r: 35, fill: 'rgba(74, 158, 255, 0.3)', stroke: '#4a9eff' },
            { label: '원피스', sub: '검색어', cx: 300, cy: 60, r: 30, fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b' },
            { label: '블라우스', sub: '검색어', cx: 300, cy: 150, r: 30, fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b' },
            { label: '니트', sub: '검색어', cx: 300, cy: 230, r: 30, fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b' },
            { label: '상품 X', sub: '도매 C', cx: 520, cy: 80, r: 35, fill: 'rgba(16, 185, 129, 0.3)', stroke: '#10b981' },
            { label: '상품 Y', sub: '도매 D', cx: 520, cy: 200, r: 35, fill: 'rgba(16, 185, 129, 0.3)', stroke: '#10b981' },
            { label: '기획/생산', sub: '', cx: 700, cy: 140, r: 40, fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444' },
        ];

        // Define edges
        const edges = [
            { from: 0, to: 2, label: '검색', color: '#6b6b80' },
            { from: 0, to: 3, label: '검색', color: '#6b6b80' },
            { from: 1, to: 3, label: '검색', color: '#6b6b80' },
            { from: 1, to: 4, label: '검색', color: '#6b6b80' },
            { from: 2, to: 5, label: '매칭', color: '#f59e0b' },
            { from: 3, to: 5, label: '매칭', color: '#f59e0b' },
            { from: 3, to: 6, label: '매칭', color: '#f59e0b' },
            { from: 4, to: 6, label: '매칭', color: '#f59e0b' },
            { from: 5, to: 7, label: '', color: '#10b981' },
            { from: 6, to: 7, label: '', color: '#10b981' },
        ];

        // Draw edges first (so they're behind nodes)
        const edgeElements = edges.map(e => {
            const from = nodes[e.from];
            const to = nodes[e.to];
            return createEdge(svg, from.cx, from.cy, to.cx, to.cy, e.color, e.label);
        });

        // Draw nodes
        const nodeElements = nodes.map(n => {
            return createNode(svg, n.cx, n.cy, n.r, n.fill, n.stroke, n.label, n.sub);
        });

        // Legend
        const legendItems = [
            { color: '#4a9eff', label: '소매상 (Node)' },
            { color: '#f59e0b', label: '검색어 (Node)' },
            { color: '#10b981', label: '상품 (Node)' },
            { color: '#ef4444', label: '기획/생산 (Output)' },
        ];

        legendItems.forEach((item, i) => {
            const g = document.createElementNS(SVG_NS, 'g');
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', 580 + i * 0); // Vertical legend
            circle.setAttribute('cy', 0);
            // Skip legend in SVG, add it as HTML below
        });

        // Add HTML legend
        const legend = document.createElement('div');
        legend.className = 'graphrag-legend';
        legend.innerHTML = legendItems.map(item =>
            `<span class="graphrag-legend__item"><span class="graphrag-legend__dot" style="background:${item.color}"></span>${item.label}</span>`
        ).join('');
        container.appendChild(legend);

        // Animate on visibility
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Animate nodes appearing
                nodeElements.forEach((el, i) => {
                    setTimeout(() => { el.style.opacity = '1'; }, i * 100);
                });
                // Animate edges drawing
                edgeElements.forEach((e, i) => {
                    setTimeout(() => { e.line.style.strokeDashoffset = '0'; }, 300 + i * 80);
                });
            } else {
                // Reset
                nodeElements.forEach(el => { el.style.opacity = '0'; });
                edgeElements.forEach(e => {
                    const length = e.line.getAttribute('stroke-dasharray');
                    e.line.style.strokeDashoffset = length;
                });
            }
        }, { threshold: 0.3 });

        observer.observe(container);
    }

    // Initialize all diagrams
    document.addEventListener('DOMContentLoaded', () => {
        buildGraphRAG();
    });

    return { buildGraphRAG };
})();
