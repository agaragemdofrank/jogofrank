// Shop JavaScript Functions
let cart = [];
let cartTotal = 0;

document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
    loadCart();
});

// Initialize Shop Functions
function initializeShop() {
    setupCategoryFilters();
    setupCartFunctionality();
}

// Category Filtering
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter products
            const category = button.getAttribute('data-category');
            filterProducts(category, productCards);
        });
    });
}

function filterProducts(category, productCards) {
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
            card.classList.add('show');
        } else {
            card.classList.add('hidden');
            card.classList.remove('show');
        }
    });
}

// Cart Functionality
function setupCartFunctionality() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('frankturbo_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

function addToCart(productId, price) {
    // Find if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Get product name from the card
        const productCard = document.querySelector(`[onclick*="${productId}"]`).closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCart();
    showAddToCartAnimation();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCart();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart total
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = cartTotal.toFixed(2).replace('.', ',');
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <span class="empty-icon">🛒</span>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    🗑️
                </button>
            </div>
        `).join('');
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

function saveCart() {
    localStorage.setItem('frankturbo_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('frankturbo_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

function showAddToCartAnimation() {
    // Create floating animation
    const cartToggle = document.querySelector('.cart-toggle');
    cartToggle.style.animation = 'bounce 0.5s ease';
    
    setTimeout(() => {
        cartToggle.style.animation = '';
    }, 500);
    
    // Show success message
    showNotification('Produto adicionado ao carrinho! 🛒', 'success');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'warning');
        return;
    }
    
    // Simulate checkout process
    showNotification('Redirecionando para pagamento...', 'info');
    
    setTimeout(() => {
        // In a real implementation, this would redirect to a payment processor
        alert(`Checkout simulado!\n\nTotal: R$ ${cartTotal.toFixed(2).replace('.', ',')}\n\nEm uma implementação real, você seria redirecionado para o processador de pagamento.`);
    }, 1000);
}

// Newsletter Subscription
function subscribeNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Simulate newsletter subscription
    showNotification('E-mail cadastrado com sucesso! 📧', 'success');
    event.target.reset();
    
    // In a real implementation, this would send the email to a backend service
    console.log('Newsletter subscription:', email);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Close cart when clicking outside
document.addEventListener('click', function(event) {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartToggle = document.querySelector('.cart-toggle');
    
    if (!cartSidebar.contains(event.target) && !cartToggle.contains(event.target)) {
        cartSidebar.classList.remove('open');
    }
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-dark);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 1rem 1.5rem;
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    }
    
    .notification-success {
        border-color: #4CAF50;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d4a2d 100%);
    }
    
    .notification-warning {
        border-color: #FF9800;
        background: linear-gradient(135deg, #1a1a1a 0%, #4a3d2d 100%);
    }
    
    .notification-info {
        border-color: var(--primary-color);
        background: var(--gradient-dark);
    }
    
    .notification button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.2rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification button:hover {
        background: rgba(255, 107, 53, 0.2);
        color: var(--primary-color);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        80% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(notificationStyles);

