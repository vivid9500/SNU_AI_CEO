/* === Main Application Initialization === */
document.addEventListener('DOMContentLoaded', () => {
    // Print/PDF export button
    document.getElementById('btn-print').addEventListener('click', () => {
        window.print();
    });

    // Add GraphRAG legend styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .graphrag-legend {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }
        .graphrag-legend__item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .graphrag-legend__dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

    console.log('Presentation initialized successfully.');
});
