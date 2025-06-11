// Videos Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeVideosPage();
});

function initializeVideosPage() {
    setupVideoFiltering();
    setupVideoInteractions();
}

// Video Category Filtering
function filterVideos(category) {
    const videoCards = document.querySelectorAll('.video-card');
    const categoryButtons = document.querySelectorAll('.category-card');
    
    // Update active category
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.category-card').classList.add('active');
    
    // Filter videos
    videoCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.classList.add('show');
        } else {
            card.style.display = 'none';
            card.classList.remove('show');
        }
    });
    
    // Update category count
    const visibleVideos = document.querySelectorAll('.video-card[style*="block"], .video-card:not([style*="none"])').length;
    showNotification(`Mostrando ${visibleVideos} vídeos da categoria selecionada`, 'info');
}

function setupVideoFiltering() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            filterVideos(category);
        });
    });
}

function setupVideoInteractions() {
    const watchButtons = document.querySelectorAll('.watch-btn');
    watchButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real implementation, this would open the YouTube video
            showNotification('Redirecionando para o YouTube...', 'info');
            setTimeout(() => {
                window.open('https://youtube.com/@garagemfrank', '_blank');
            }, 1000);
        });
    });
}

function loadMoreVideos() {
    // Simulate loading more videos
    showNotification('Carregando mais vídeos...', 'info');
    
    setTimeout(() => {
        showNotification('Todos os vídeos foram carregados!', 'success');
    }, 2000);
}

// Notification System for Videos Page
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.video-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `video-notification notification-${type}`;
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

// Add video notification styles
const videoNotificationStyles = document.createElement('style');
videoNotificationStyles.textContent = `
    .video-notification {
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
        color: var(--text-primary);
    }
    
    .notification-success {
        border-color: #4CAF50;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d4a2d 100%);
    }
    
    .notification-info {
        border-color: var(--primary-color);
        background: var(--gradient-dark);
    }
    
    .video-notification button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.2rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .video-notification button:hover {
        background: rgba(255, 107, 53, 0.2);
        color: var(--primary-color);
    }
`;
document.head.appendChild(videoNotificationStyles);

