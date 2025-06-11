// Main Portal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializePortal();
    loadRankingData();
    updateGameStats();
});

// Initialize Portal Functions
function initializePortal() {
    setupMobileNavigation();
    setupSmoothScrolling();
    setupAnimations();
}

// Mobile Navigation
function setupMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Smooth Scrolling
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animations on Scroll
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    const animatedElements = document.querySelectorAll('.about-card, .feature-card, .ranking-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Game Redirection
function redirectToGame() {
    // Add loading animation
    showLoadingMessage();
    
    // Redirect to game after short delay
    setTimeout(() => {
        window.location.href = 'game/index.html';
    }, 1000);
}

function showLoadingMessage() {
    const gameCard = document.querySelector('.game-card');
    if (gameCard) {
        const originalContent = gameCard.innerHTML;
        gameCard.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎮</div>
                <h3>Carregando Simulador...</h3>
                <p style="color: var(--text-secondary);">Preparando a experiência épica!</p>
                <div style="margin-top: 1rem;">
                    <div style="width: 100%; height: 4px; background: rgba(255,107,53,0.2); border-radius: 2px; overflow: hidden;">
                        <div style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff6b35, #f7931e); border-radius: 2px; animation: loading 1s ease-in-out;" id="loading-bar"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Animate loading bar
        setTimeout(() => {
            const loadingBar = document.getElementById('loading-bar');
            if (loadingBar) {
                loadingBar.style.width = '100%';
                loadingBar.style.transition = 'width 0.8s ease';
            }
        }, 100);
    }
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Load Ranking Data
function loadRankingData() {
    // Simulate loading ranking from localStorage or API
    const savedRanking = localStorage.getItem('frankturbo_ranking');
    
    if (savedRanking) {
        try {
            const ranking = JSON.parse(savedRanking);
            updateRankingDisplay(ranking);
        } catch (e) {
            console.log('Error loading ranking data');
            loadDefaultRanking();
        }
    } else {
        loadDefaultRanking();
    }
}

function loadDefaultRanking() {
    const defaultRanking = [
        { nick: 'SpeedDemon', time: 0.089, date: 'Hoje' },
        { nick: 'TurboFrank', time: 0.092, date: 'Ontem' },
        { nick: 'RocketMan', time: 0.095, date: '2 dias' },
        { nick: 'NitroQueen', time: 0.098, date: '3 dias' },
        { nick: 'V8Thunder', time: 0.101, date: '1 semana' },
        { nick: 'SpeedRacer', time: 0.105, date: '1 semana' },
        { nick: 'TurboMax', time: 0.108, date: '2 semanas' },
        { nick: 'FastLane', time: 0.112, date: '2 semanas' },
        { nick: 'NitroBoost', time: 0.115, date: '3 semanas' },
        { nick: 'RaceKing', time: 0.118, date: '1 mês' }
    ];
    
    updateRankingDisplay(defaultRanking);
}

function updateRankingDisplay(ranking) {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    
    rankingList.innerHTML = '';
    
    ranking.slice(0, 10).forEach((player, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        rankingItem.innerHTML = `
            <div class="rank-position">#${index + 1}</div>
            <div class="rank-info">
                <span class="rank-nick">${player.nick}</span>
                <span class="rank-time">${player.time.toFixed(3)}s</span>
            </div>
            <div class="rank-date">${player.date}</div>
        `;
        
        // Add animation delay
        rankingItem.style.animationDelay = `${index * 0.1}s`;
        rankingList.appendChild(rankingItem);
    });
}

// Update Game Stats
function updateGameStats() {
    // Simulate real-time stats
    const stats = {
        totalPlayers: Math.floor(Math.random() * 500) + 1000,
        totalGames: Math.floor(Math.random() * 5000) + 15000,
        bestRecord: 0.089
    };
    
    // Update display with animation
    animateCounter('total-players', stats.totalPlayers);
    animateCounter('total-games', stats.totalGames);
    
    const bestRecordEl = document.getElementById('best-record');
    if (bestRecordEl) {
        bestRecordEl.textContent = `${stats.bestRecord.toFixed(3)}s`;
    }
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Navigation Active State
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize active navigation
updateActiveNavigation();

// Refresh ranking periodically
setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance every interval
        loadRankingData();
    }
}, 30000); // Every 30 seconds

// Add loading animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes loading {
        0% { width: 0%; }
        100% { width: 100%; }
    }
    
    .ranking-item {
        animation: slideInRight 0.6s ease forwards;
        opacity: 0;
        transform: translateX(30px);
    }
    
    @keyframes slideInRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

