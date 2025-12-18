document.addEventListener('DOMContentLoaded', () => {
    // Carousel Functionality
    const track = document.querySelector('.carousel-track');

    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-arrow.next');
        const prevButton = document.querySelector('.carousel-arrow.prev');

        // Get slide width including gap
        const updateSlideWidth = () => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 0;
            return slideWidth + gap;
        };

        let itemWidth = updateSlideWidth();
        let currentSlideIndex = 0;

        // Number of slides visible
        const getVisibleSlides = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        };

        const moveToSlide = (index) => {
            itemWidth = updateSlideWidth();
            const amountToMove = index * itemWidth;
            track.style.transform = 'translateX(-' + amountToMove + 'px)';
            currentSlideIndex = index;

            // Handle button states
            // Infinite scroll logic logic
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const visibleSlides = getVisibleSlides();
                const maxIndex = slides.length - visibleSlides;

                if (currentSlideIndex < maxIndex) {
                    moveToSlide(currentSlideIndex + 1);
                } else {
                    moveToSlide(0); // Loop back to start
                }
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const visibleSlides = getVisibleSlides();
                const maxIndex = slides.length - visibleSlides;

                if (currentSlideIndex > 0) {
                    moveToSlide(currentSlideIndex - 1);
                } else {
                    moveToSlide(maxIndex); // Loop to end
                }
            });
        }

        // Handle Resize
        window.addEventListener('resize', () => {
            // Reset to 0 to avoid alignment issues on resize
            moveToSlide(0);
        });
    }

    // Cart Logic
    class Cart {
        constructor() {
            this.items = JSON.parse(localStorage.getItem('cart')) || [];
            this.cartIcon = document.querySelector('.cart-icon a');
            this.cartCount = document.querySelector('.cart-count');
            this.init();
        }

        init() {
            this.updateCounter();
            this.renderDropdown();
            this.injectDropdown();
            this.injectCheckoutModal();
            this.setupListeners();
        }

        add(product) {
            const existingItem = this.items.find(item => item.name === product.name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }
            this.save();
            this.animateCounter();
        }

        remove(itemName) {
            this.items = this.items.filter(item => item.name !== itemName);
            this.save();
        }

        updateQuantity(itemName, change) {
            const item = this.items.find(item => item.name === itemName);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    this.remove(itemName);
                } else {
                    this.save();
                }
            }
        }

        save() {
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCounter();
            this.renderDropdown();
        }

        updateCounter() {
            const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
            this.cartCount.textContent = totalCount;
        }

        animateCounter() {
            this.cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.cartCount.style.transform = 'scale(1)';
            }, 200);
        }

        getTotal() {
            return this.items.reduce((total, item) => {
                const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                return total + (price * item.quantity);
            }, 0).toFixed(2);
        }

        injectDropdown() {
            if (!document.getElementById('cart-dropdown')) {
                const dropdownHtml = `
                    <div id="cart-dropdown">
                        <div class="cart-header">
                            <span>Your Cart</span>
                            <span class="close-cart" style="cursor:pointer">&times;</span>
                        </div>
                        <div class="cart-items">
                            <!-- Items injected here -->
                            <p style="text-align:center; color:#888;">Your cart is empty.</p>
                        </div>
                        <div class="cart-footer">
                            <div class="cart-total">
                                <span>Total:</span>
                                <span class="total-price">0.00 DH</span>
                            </div>
                            <button id="checkout-btn" class="btn btn-primary btn-block">Proceed to Checkout</button>
                        </div>
                    </div>
                `;
                // Check if .cart-icon exists to append to its container parent or directly to header-icons
                const container = document.querySelector('.header-icons');
                if (container) {
                    container.insertAdjacentHTML('beforeend', dropdownHtml);
                }
            }
        }

        renderDropdown() {
            const dropdownItems = document.querySelector('.cart-items');
            const totalPriceEl = document.querySelector('.total-price');

            if (!dropdownItems) return; // Guard clause if dropdown not injected yet

            if (this.items.length === 0) {
                dropdownItems.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">Your cart is empty.</p>';
                totalPriceEl.textContent = '0.00 DH';
                return;
            }

            dropdownItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <p class="cart-item-title">${item.name}</p>
                        <p class="cart-item-price">${item.price}</p>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-name="${item.name}" data-change="-1">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-name="${item.name}" data-change="1">+</button>
                            <i class="fa-solid fa-trash cart-item-remove" data-name="${item.name}"></i>
                        </div>
                    </div>
                </div>
            `).join('');

            totalPriceEl.textContent = this.getTotal() + ' DH';
        }

        setupListeners() {
            // Add to Cart Buttons
            document.body.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) {
                    const btn = e.target;
                    const product = {
                        name: btn.dataset.product,
                        price: btn.dataset.price,
                        image: btn.dataset.image
                    };
                    this.add(product);

                    // Show dropdown briefly or just animate count? 
                    // Requirement: counter increases. Dropdown shown on click.
                }
            });

            // Toggle Dropdown
            if (this.cartIcon) {
                this.cartIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('cart-dropdown').classList.toggle('show');
                });
            }

            // Close Dropdown
            document.body.addEventListener('click', (e) => {
                const dropdown = document.getElementById('cart-dropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    if (!dropdown.contains(e.target) && !this.cartIcon.contains(e.target)) {
                        dropdown.classList.remove('show');
                    }
                }
            });

            // Dropdown Internal Clicks (Qty, Remove, Close)
            const dropdown = document.getElementById('cart-dropdown');
            if (dropdown) {
                dropdown.addEventListener('click', (e) => {
                    const target = e.target;

                    if (target.classList.contains('close-cart')) {
                        dropdown.classList.remove('show');
                    }
                    else if (target.classList.contains('qty-btn')) {
                        const name = target.dataset.name;
                        const change = parseInt(target.dataset.change);
                        this.updateQuantity(name, change);
                    }
                    else if (target.classList.contains('cart-item-remove')) {
                        const name = target.dataset.name;
                        this.remove(name);
                    }
                    else if (target.id === 'checkout-btn') {
                        dropdown.classList.remove('show');
                        this.openCheckout();
                    }
                });
            }
        }

        injectCheckoutModal() {
            if (!document.getElementById('checkout-modal')) {
                const modalHtml = `
                    <div id="checkout-modal" class="modal">
                        <div class="modal-content slide-up">
                            <span class="close-modal close-checkout">&times;</span>
                            <h2>Complete Your Order</h2>
                            <div id="order-summary" style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                                <!-- Summary injected here -->
                            </div>
                            <form id="global-order-form">
                                <div class="form-group">
                                    <label for="full-name">Full Name</label>
                                    <input type="text" id="full-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone Number</label>
                                    <input type="tel" id="phone" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" required>
                                </div>
                                <div class="form-group">
                                    <label for="address">Address</label>
                                    <textarea id="address" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">Confirm Order</button>
                            </form>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                // Modal Listeners
                const modal = document.getElementById('checkout-modal');
                const closeBtn = modal.querySelector('.close-checkout');
                const form = document.getElementById('global-order-form');

                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('show');
                });

                window.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('show');
                    }
                });

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (this.items.length === 0) {
                        alert("Your cart is empty!");
                        return;
                    }
                    alert("Thank you for your order! We will contact you shortly.");
                    this.items = []; // Clear cart
                    this.save();
                    modal.classList.remove('show');
                    document.getElementById('global-order-form').reset();
                });
            }
        }

        openCheckout() {
            const modal = document.getElementById('checkout-modal');
            const summary = document.getElementById('order-summary');

            if (this.items.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            const itemList = this.items.map(item => `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${item.price}</span>
                </div>
            `).join('');

            summary.innerHTML = `
                <h4 style="margin-bottom:10px;">Order Summary</h4>
                ${itemList}
                <hr style="margin:10px 0; border:0; border-top:1px solid #ddd;">
                <div style="display:flex; justify-content:space-between; font-weight:bold;">
                    <span>Total:</span>
                    <span>${this.getTotal()} DH</span>
                </div>
            `;

            modal.classList.add('show');
        }
    }

    // Initialize Cart
    new Cart();

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
});
