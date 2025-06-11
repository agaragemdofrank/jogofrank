// Support Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeSupportPage();
});

function initializeSupportPage() {
    setupModalFunctionality();
    setupSupportInteractions();
}

// Modal Functions
function showDonationOptions() {
    const modal = document.getElementById('donation-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function showSponsorshipInfo() {
    showNotification('Entre em contato conosco para informações sobre patrocínio!', 'info');
    setTimeout(() => {
        window.location.href = 'contato.html';
    }, 2000);
}

function showPartsInfo() {
    showNotification('Entre em contato para combinar a doação de peças!', 'info');
    setTimeout(() => {
        window.location.href = 'contato.html';
    }, 2000);
}

function showToolsInfo() {
    showNotification('Entre em contato para combinar a doação de ferramentas!', 'info');
    setTimeout(() => {
        window.location.href = 'contato.html';
    }, 2000);
}

function shareContent() {
    if (navigator.share) {
        navigator.share({
            title: 'A Garagem do Frank',
            text: 'Confira o melhor conteúdo automotivo do Brasil!',
            url: window.location.origin
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard(window.location.origin);
        showNotification('Link copiado! Compartilhe com seus amigos!', 'success');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function setupModalFunctionality() {
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

function setupSupportInteractions() {
    // Setup amount buttons
    const amountButtons = document.querySelectorAll('.amount-btn');
    amountButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.textContent;
            showNotification(`Valor ${amount} selecionado! Use a chave PIX para doar.`, 'info');
        });
    });
}

// Copy to clipboard function
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Chave PIX copiada para a área de transferência!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Chave PIX copiada para a área de transferência!', 'success');
    }
}

// Progress bar animation
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

// Initialize progress bar animation when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animateProgressBars, 1000);
});

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.support-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `support-notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Add support notification styles
const supportNotificationStyles = document.createElement('style');
supportNotificationStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }
    
    .modal-content {
        background: var(--gradient-dark);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 2rem 2rem 1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        font-family: 'Orbitron', monospace;
        color: var(--primary-color);
        margin: 0;
    }
    
    .close-modal {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .close-modal:hover {
        color: var(--primary-color);
    }
    
    .modal-body {
        padding: 2rem;
    }
    
    .donation-options {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .donation-option {
        background: rgba(255, 107, 53, 0.1);
        border: 1px solid var(--border-color);
        border-radius: 15px;
        padding: 1.5rem;
    }
    
    .donation-option h4 {
        font-family: 'Orbitron', monospace;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .copy-btn {
        background: var(--gradient-primary);
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 1rem;
    }
    
    .copy-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px var(--shadow-color);
    }
    
    .suggested-amounts {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin: 1rem 0;
    }
    
    .amount-btn {
        background: transparent;
        border: 2px solid var(--border-color);
        color: var(--text-primary);
        padding: 0.8rem;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
    }
    
    .amount-btn:hover {
        background: var(--gradient-primary);
        border-color: var(--primary-color);
        color: white;
    }
    
    .donation-note {
        background: rgba(255, 107, 53, 0.1);
        border-left: 4px solid var(--primary-color);
        padding: 1rem;
        margin-top: 2rem;
        border-radius: 0 10px 10px 0;
    }
    
    .support-notification {
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
    
    .support-notification button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.2rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .support-notification button:hover {
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
    
    @media (max-width: 768px) {
        .modal-content {
            margin: 1rem;
            max-height: 90vh;
        }
        
        .suggested-amounts {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(supportNotificationStyles);

