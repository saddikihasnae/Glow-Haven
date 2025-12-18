document.addEventListener('DOMContentLoaded', () => {
    // Scroll to Products
    const scrollBtn = document.getElementById('scroll-to-products');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const productsSection = document.getElementById('products-section');
            productsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Fade-in Animation on Scroll
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // NOTE: Modal logic has been moved to main.js to serve the global Shopping Cart functionality.
});
