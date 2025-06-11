// Main Portal JavaScript - VERSÃO LIMPA
document.addEventListener('DOMContentLoaded', function() {
    initializePortal();
});

function initializePortal() {
    setupNavigation();
    setupGameCard();
    setupMobileMenu();
    setupScrollEffects();
    initializeStats();
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Handle navigation
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Game Card Setup
function setupGameCard() {
    const gameCard = document.querySelector('.game-card');
    const playButton = document.querySelector('.play-button');
    
    if (playButton) {
        playButton.addEventListener('click', function() {
            // Redirect to game
            window.location.href = './game/index.html';
        });
    }
    
    if (gameCard) {
        gameCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        gameCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Mobile Menu Setup
function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    }
    
    // Close menu when clicking on links
    const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// Scroll Effects
function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const scrolled = window.pageYOffset;
        
        if (header) {
            if (scrolled > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            const speed = scrolled * 0.5;
            hero.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Initialize Statistics - VERSÃO LIMPA
function initializeStats() {
    // Carregar estatísticas reais do Google Sheets ou localStorage
    loadRealStats();
}

async function loadRealStats() {
    try {
        // Tentar carregar estatísticas reais do Google Sheets
        if (window.sheetsIntegration) {
            const stats = await window.sheetsIntegration.getStats();
            
            if (stats.success) {
                updateStatsDisplay(stats.data);
                return;
            }
        }
        
        // Fallback para estatísticas locais ou zeradas
        const defaultStats = {
            totalPlayers: 0,
            totalGames: 0,
            bestTime: 'N/A',
            onlineNow: 0
        };
        
        updateStatsDisplay(defaultStats);
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        
        // Mostrar estatísticas zeradas em caso de erro
        const emptyStats = {
            totalPlayers: 0,
            totalGames: 0,
            bestTime: 'N/A',
            onlineNow: 0
        };
        
        updateStatsDisplay(emptyStats);
    }
}

function updateStatsDisplay(stats) {
    // Atualizar elementos de estatísticas na página
    const elements = {
        totalPlayers: document.querySelector('.stat-total-players'),
        totalGames: document.querySelector('.stat-total-games'),
        bestTime: document.querySelector('.stat-best-time'),
        onlineNow: document.querySelector('.stat-online-now')
    };
    
    if (elements.totalPlayers) {
        elements.totalPlayers.textContent = formatNumber(stats.totalPlayers);
    }
    
    if (elements.totalGames) {
        elements.totalGames.textContent = formatNumber(stats.totalGames);
    }
    
    if (elements.bestTime) {
        elements.bestTime.textContent = stats.bestTime === 'N/A' ? 'N/A' : `${stats.bestTime}s`;
    }
    
    if (elements.onlineNow) {
        elements.onlineNow.textContent = formatNumber(stats.onlineNow);
    }
}

function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function updateOnlineCounter() {
    // Atualizar contador de usuários online
    // Esta função pode ser chamada periodicamente para mostrar atividade real
    const onlineElement = document.querySelector('.stat-online-now');
    if (onlineElement && window.sheetsIntegration) {
        // Implementar lógica real de usuários online se necessário
    }
}

// Inicializar contador online
setInterval(updateOnlineCounter, 60000); // Atualizar a cada minuto

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Loading state management
function showLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Erro na página:', e.error);
    // Não mostrar erros para o usuário final, apenas logar
});

// Performance monitoring
window.addEventListener('load', function() {
    // Log performance metrics if needed
    const loadTime = performance.now();
    console.log(`Página carregada em ${loadTime.toFixed(2)}ms`);
});

