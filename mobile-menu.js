// Menu Mobile para A Garagem do Frank
// Implementação de navegação responsiva para dispositivos móveis

document.addEventListener('DOMContentLoaded', function() {
    // Criar elementos do menu mobile
    createMobileMenuElements();
    
    // Adicionar event listeners
    setupMobileMenuEventListeners();
    
    // Verificar tamanho da tela e ajustar menu conforme necessário
    checkScreenSize();
    
    // Monitorar redimensionamento da janela
    window.addEventListener('resize', checkScreenSize);
});

// Função para criar os elementos do menu mobile
function createMobileMenuElements() {
    // Criar botão hambúrguer
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    menuToggle.innerHTML = `
        <div class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    // Criar overlay do menu
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'mobile-menu-overlay';
    
    // Criar o menu mobile
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <div class="mobile-menu-header">
            <img src="images/logo.png" alt="Logo Garagem do Frank" class="mobile-menu-logo">
            <h2 class="mobile-menu-title">A Garagem do Frank</h2>
        </div>
        
        <div class="mobile-menu-content">
            <ul class="mobile-menu-nav">
                <li><a href="#" class="active" data-section="game"><i>🎮</i> Simulador</a></li>
                <li><a href="#" data-section="ranking"><i>🏆</i> Ranking</a></li>
                <li><a href="#" data-section="achievements"><i>🏅</i> Conquistas</a></li>
                <li><a href="#" data-section="profile"><i>👤</i> Meu Perfil</a></li>
                <li><a href="https://youtube.com/@agaragemdofrank" target="_blank"><i>📺</i> Canal no YouTube</a></li>
                <li><a href="https://instagram.com/agaragemdofrank" target="_blank"><i>📸</i> Instagram</a></li>
            </ul>
            
            <div class="mobile-menu-player">
                <div class="mobile-menu-player-info">
                    <span class="mobile-menu-player-name" id="mobile-player-name">Jogador</span>
                    <span class="mobile-menu-player-nick" id="mobile-player-nick">@nick</span>
                </div>
                
                <div class="mobile-menu-player-stats">
                    <div class="mobile-menu-player-stat">
                        <span class="mobile-menu-player-stat-label">Melhor Tempo</span>
                        <span class="mobile-menu-player-stat-value" id="mobile-best-time">--</span>
                    </div>
                    <div class="mobile-menu-player-stat">
                        <span class="mobile-menu-player-stat-label">Pontos</span>
                        <span class="mobile-menu-player-stat-value" id="mobile-points">0</span>
                    </div>
                    <div class="mobile-menu-player-stat">
                        <span class="mobile-menu-player-stat-label">Jogadas</span>
                        <span class="mobile-menu-player-stat-value" id="mobile-games">0</span>
                    </div>
                    <div class="mobile-menu-player-stat">
                        <span class="mobile-menu-player-stat-label">Posição</span>
                        <span class="mobile-menu-player-stat-value" id="mobile-position">#--</span>
                    </div>
                </div>
                
                <button id="mobile-change-player" class="change-player-btn" style="width: 100%; margin-top: 10px;">Trocar Jogador</button>
            </div>
        </div>
        
        <div class="mobile-menu-footer">
            <div class="mobile-menu-social">
                <a href="https://youtube.com/@agaragemdofrank" target="_blank" aria-label="YouTube">📺</a>
                <a href="https://instagram.com/agaragemdofrank" target="_blank" aria-label="Instagram">📸</a>
                <a href="https://tiktok.com/@agaragemdofrank" target="_blank" aria-label="TikTok">🎵</a>
            </div>
            <div class="mobile-menu-copyright">
                &copy; 2025 A Garagem do Frank
            </div>
        </div>
    `;
    
    // Adicionar elementos ao DOM
    document.body.appendChild(menuToggle);
    document.body.appendChild(menuOverlay);
    document.body.appendChild(mobileMenu);
}

// Configurar event listeners para o menu mobile
function setupMobileMenuEventListeners() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuLinks = document.querySelectorAll('.mobile-menu-nav a');
    const mobileChangePlayerBtn = document.getElementById('mobile-change-player');
    
    // Abrir/fechar menu ao clicar no botão hambúrguer
    menuToggle.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // Fechar menu ao clicar no overlay
    menuOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });
    
    // Navegação do menu
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Não fechar o menu para links externos
            if (!this.getAttribute('target')) {
                e.preventDefault();
                
                // Remover classe active de todos os links
                menuLinks.forEach(l => l.classList.remove('active'));
                
                // Adicionar classe active ao link clicado
                this.classList.add('active');
                
                // Navegar para a seção correspondente
                const section = this.getAttribute('data-section');
                navigateToSection(section);
                
                // Fechar o menu
                closeMobileMenu();
            }
        });
    });
    
    // Sincronizar botão de trocar jogador
    if (mobileChangePlayerBtn) {
        mobileChangePlayerBtn.addEventListener('click', function() {
            // Fechar o menu
            closeMobileMenu();
            
            // Acionar o botão principal de trocar jogador
            const mainChangePlayerBtn = document.getElementById('change-player');
            if (mainChangePlayerBtn) {
                mainChangePlayerBtn.click();
            }
        });
    }
}

// Função para alternar o menu mobile
function toggleMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuToggle.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Gerenciar acessibilidade e scroll
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden'; // Impedir scroll do body
        menuToggle.setAttribute('aria-label', 'Fechar menu');
        menuToggle.setAttribute('aria-expanded', 'true');
    } else {
        document.body.style.overflow = ''; // Restaurar scroll
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
}

// Função para fechar o menu mobile
function closeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('active');
    mobileMenu.classList.remove('active');
    
    document.body.style.overflow = ''; // Restaurar scroll
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    menuToggle.setAttribute('aria-expanded', 'false');
}

// Função para navegar para uma seção específica
function navigateToSection(section) {
    // Implementar navegação para diferentes seções
    switch (section) {
        case 'game':
            // Mostrar área do jogo
            scrollToElement('.game-area');
            break;
        case 'ranking':
            // Mostrar área de ranking
            scrollToElement('.ranking-section');
            break;
        case 'achievements':
            // Mostrar área de conquistas
            scrollToElement('.achievements');
            break;
        case 'profile':
            // Mostrar área do perfil
            scrollToElement('.player-info');
            break;
    }
}

// Função para rolar suavemente até um elemento
function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Verificar tamanho da tela e ajustar conforme necessário
function checkScreenSize() {
    // Atualizar dados do jogador no menu mobile
    updateMobileMenuPlayerInfo();
}

// Atualizar informações do jogador no menu mobile
function updateMobileMenuPlayerInfo() {
    // Verificar se os elementos existem
    const mobilePlayerName = document.getElementById('mobile-player-name');
    const mobilePlayerNick = document.getElementById('mobile-player-nick');
    const mobileBestTime = document.getElementById('mobile-best-time');
    const mobilePoints = document.getElementById('mobile-points');
    const mobileGames = document.getElementById('mobile-games');
    const mobilePosition = document.getElementById('mobile-position');
    
    // Obter dados do jogador atual
    const playerNameDisplay = document.getElementById('player-name-display');
    const playerNickDisplay = document.getElementById('player-nick-display');
    const personalBestSpan = document.getElementById('personal-best');
    const playerPointsSpan = document.getElementById('player-points');
    const totalGamesSpan = document.getElementById('total-games');
    const globalPositionSpan = document.getElementById('global-position');
    
    // Atualizar dados no menu mobile
    if (mobilePlayerName && playerNameDisplay) {
        mobilePlayerName.textContent = playerNameDisplay.textContent;
    }
    
    if (mobilePlayerNick && playerNickDisplay) {
        mobilePlayerNick.textContent = playerNickDisplay.textContent;
    }
    
    if (mobileBestTime && personalBestSpan) {
        mobileBestTime.textContent = personalBestSpan.textContent;
    }
    
    if (mobilePoints && playerPointsSpan) {
        mobilePoints.textContent = playerPointsSpan.textContent;
    }
    
    if (mobileGames && totalGamesSpan) {
        mobileGames.textContent = totalGamesSpan.textContent;
    }
    
    if (mobilePosition && globalPositionSpan) {
        mobilePosition.textContent = globalPositionSpan.textContent;
    }
}

// Exportar funções para uso global
window.mobileMenu = {
    toggle: toggleMobileMenu,
    close: closeMobileMenu,
    updatePlayerInfo: updateMobileMenuPlayerInfo
};

// Adicionar hook para atualizar o menu mobile quando os dados do jogador mudarem
// Isso deve ser chamado sempre que os dados do jogador forem atualizados
function hookPlayerDataUpdate() {
    const originalUpdatePlayerInfo = window.updatePlayerInfo;
    
    if (typeof originalUpdatePlayerInfo === 'function') {
        window.updatePlayerInfo = function(player) {
            // Chamar a função original
            originalUpdatePlayerInfo(player);
            
            // Atualizar o menu mobile
            updateMobileMenuPlayerInfo();
        };
    }
}

// Tentar configurar o hook quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(hookPlayerDataUpdate, 1000);
});
