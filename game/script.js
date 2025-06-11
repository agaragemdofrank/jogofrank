// Configuração do Google Sheets e Google Sign-In
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

// Lista de nicks já cadastrados (será carregada do servidor)
let registeredNicks = new Set();

// Elementos do DOM
const signupModal = document.getElementById('signup-modal');
const signupForm = document.getElementById('signup-form');
const connectionStatus = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');
const syncInfo = document.getElementById('sync-info');

// Form elements
const playerNameInput = document.getElementById('player-name');
const playerNickInput = document.getElementById('player-nick');
const playerInstagramInput = document.getElementById('player-instagram');
const howFoundSelect = document.getElementById('how-found');
const nickStatus = document.getElementById('nick-status');
const startGameBtn = document.getElementById('start-game-btn');

// Player info elements
const playerNameDisplay = document.getElementById('player-name-display');
const playerNickDisplay = document.getElementById('player-nick-display');
const changePlayerBtn = document.getElementById('change-player');
const totalGamesSpan = document.getElementById('total-games');
const personalBestSpan = document.getElementById('personal-best');
const playerPointsSpan = document.getElementById('player-points');
const globalPositionSpan = document.getElementById('global-position');

// Game elements
const preStage1Left = document.querySelector('.pre-stage-1-left');
const preStage1Right = document.querySelector('.pre-stage-1-right');
const preStage2Left = document.querySelector('.pre-stage-2-left');
const preStage2Right = document.querySelector('.pre-stage-2-right');
const stage1Left = document.querySelector('.stage-1-left');
const stage1Right = document.querySelector('.stage-1-right');
const stage2Left = document.querySelector('.stage-2-left');
const stage2Right = document.querySelector('.stage-2-right');
const amber1Left = document.querySelector('.amber-1-left');
const amber1Right = document.querySelector('.amber-1-right');
const amber2Left = document.querySelector('.amber-2-left');
const amber2Right = document.querySelector('.amber-2-right');
const amber3Left = document.querySelector('.amber-3-left');
const amber3Right = document.querySelector('.amber-3-right');
const greenLeft = document.querySelector('.green-left');
const greenRight = document.querySelector('.green-right');
const redLeft = document.querySelector('.red-left');
const redRight = document.querySelector('.red-right');
const startButton = document.getElementById('start-button');
const timeDisplay = document.querySelector('.time-display');
const statusMessage = document.querySelector('.status-message');

// Stats elements
const globalRankingList = document.getElementById('global-ranking-list');
const bestTimesList = document.getElementById('best-times-list');
const lastTimesList = document.getElementById('last-times-list');
const refreshRankingBtn = document.getElementById('refresh-ranking');
const totalPlayersSpan = document.getElementById('total-players');

// Challenge elements
const challengeText = document.getElementById('challenge-text');
const challengeProgressText = document.getElementById('challenge-progress-text');
const challengeProgressBar = document.getElementById('challenge-progress-bar');

// Achievements element
const achievementsContainer = document.getElementById('achievements');

// Variáveis de estado do jogo
let gameState = 'idle';
let startTime = 0;
let reactionTime = 0;
let bestTimes = [];
let lastTimes = [];
let countdownTimers = [];
let greenLightTimer = null;
let falseStartTime = 0;

// Dados do jogador
let currentPlayer = {
    name: '',
    nick: '',
    instagram: '',
    howFound: '',
    totalGames: 0,
    personalBest: null,
    points: 0,
    achievements: [],
    googleAccount: null
};

// Sistema de conq// Conquistas disponíveis (50 conquistas)
const achievements = [
    // CONQUISTAS DE VELOCIDADE (10)
    { id: 'sub_500', name: '🚙 Carro da Vovó', description: 'Tempo abaixo de 0.500s', points: 25, icon: '🚙' },
    { id: 'sub_400', name: '🚗 Motorista Urbano', description: 'Tempo abaixo de 0.400s', points: 40, icon: '🚗' },
    { id: 'sub_300', name: '🏎️ Aceleração Básica', description: 'Tempo abaixo de 0.300s', points: 50, icon: '🏎️' },
    { id: 'sub_250', name: '⚡ Piloto Amador', description: 'Tempo abaixo de 0.250s', points: 75, icon: '⚡' },
    { id: 'sub_200', name: '🏁 Velocista', description: 'Tempo abaixo de 0.200s', points: 100, icon: '🏁' },
    { id: 'sub_150', name: '🚀 Piloto Profissional', description: 'Tempo abaixo de 0.150s', points: 200, icon: '🚀' },
    { id: 'sub_120', name: '💨 Raio McQueen', description: 'Tempo abaixo de 0.120s', points: 350, icon: '💨' },
    { id: 'sub_100', name: '⚡ Velocidade da Luz', description: 'Tempo abaixo de 0.100s', points: 500, icon: '⚡' },
    { id: 'sub_080', name: '🛸 Foguete da NASA', description: 'Tempo abaixo de 0.080s', points: 1000, icon: '🛸' },
    { id: 'sub_060', name: '👽 Alienígena', description: 'Tempo abaixo de 0.060s', points: 2000, icon: '👽' },

    // CONQUISTAS DE CONSISTÊNCIA (8)
    { id: 'consistent_3', name: '🎯 Mira Certeira', description: '3 tempos seguidos abaixo de 0.300s', points: 100, icon: '🎯' },
    { id: 'consistent_5', name: '🔧 Mecânico Preciso', description: '5 tempos seguidos abaixo de 0.250s', points: 200, icon: '🔧' },
    { id: 'consistent_10', name: '💨 Turbo Frank', description: '10 tempos seguidos abaixo de 0.200s', points: 300, icon: '💨' },
    { id: 'consistent_15', name: '🎖️ Mestre da Consistência', description: '15 tempos seguidos abaixo de 0.200s', points: 500, icon: '🎖️' },
    { id: 'consistent_pro', name: '👑 Rei da Precisão', description: '5 tempos seguidos abaixo de 0.100s', points: 800, icon: '👑' },
    { id: 'no_burnout_10', name: '🛡️ Escudo Anti-Queimada', description: '10 largadas sem queimar', points: 150, icon: '🛡️' },
    { id: 'no_burnout_25', name: '🧘 Monge da Paciência', description: '25 largadas sem queimar', points: 400, icon: '🧘' },
    { id: 'perfect_session', name: '💎 Sessão Perfeita', description: '10 jogadas seguidas sem queimar', points: 600, icon: '💎' },

    // CONQUISTAS DE DEDICAÇÃO (8)
    { id: 'first_timer', name: '🆕 Novato na Garagem', description: 'Primeira jogada', points: 10, icon: '🆕' },
    { id: 'garage_visitor', name: '🏠 Visitante da Garagem', description: 'Jogue 10 vezes', points: 30, icon: '🏠' },
    { id: 'garage_regular', name: '🔨 Cliente Fiel', description: 'Jogue 50 vezes', points: 100, icon: '🔨' },
    { id: 'garage_veteran', name: '⚙️ Veterano da Oficina', description: 'Jogue 100 vezes', points: 200, icon: '⚙️' },
    { id: 'garage_master', name: '👑 Dono da Garagem', description: 'Jogue 250 vezes', points: 500, icon: '👑' },
    { id: 'garage_legend', name: '🏆 Lenda da Garagem', description: 'Jogue 500 vezes', points: 1000, icon: '🏆' },
    { id: 'daily_warrior', name: '📅 Guerreiro Diário', description: 'Jogue 7 dias seguidos', points: 200, icon: '📅' },
    { id: 'monthly_champion', name: '🗓️ Campeão Mensal', description: 'Jogue 30 dias seguidos', points: 1000, icon: '🗓️' },

    // CONQUISTAS ENGRAÇADAS/RUINS (10)
    { id: 'first_burnout', name: '🤡 Primeira Queimada', description: 'Queime pela primeira vez', points: 5, icon: '🤡' },
    { id: 'burnout_5', name: '🔥 Especialista em Queimada', description: 'Queime 5 vezes', points: -25, icon: '🔥' },
    { id: 'burnout_king', name: '👑 Rei da Queimada', description: 'Queime 25 vezes', points: -100, icon: '👑' },
    { id: 'burnout_legend', name: '🤡 Lenda da Queimada', description: 'Queime 50 vezes', points: -200, icon: '🤡' },
    { id: 'consecutive_burnouts', name: '🛑 Mestre do Freio', description: '5 queimadas seguidas', points: -150, icon: '🛑' },
    { id: 'turtle_speed', name: '🐢 Velocidade de Tartaruga', description: 'Tempo acima de 1.000s', points: -20, icon: '🐢' },
    { id: 'sleepy_driver', name: '😴 Piloto Sonolento', description: 'Tempo acima de 2.000s', points: -30, icon: '😴' },
    { id: 'patience_tester', name: '⏰ Testador de Paciência', description: 'Demore mais de 5s para reagir', points: -40, icon: '⏰' },
    { id: 'snail_champion', name: '🐌 Campeão Caracol', description: 'Tempo acima de 3.000s', points: -50, icon: '🐌' },
    { id: 'statue_mode', name: '🗿 Modo Estátua', description: 'Não reagir por 10s', points: -100, icon: '🗿' },

    // CONQUISTAS SOCIAIS (6)
    { id: 'instagram_connected', name: '📸 Influencer da Garagem', description: 'Cadastrou Instagram', points: 50, icon: '📸' },
    { id: 'first_referral', name: '🤝 Primeiro Amigo', description: 'Indique 1 pessoa', points: 100, icon: '🤝' },
    { id: 'social_butterfly', name: '🦋 Borboleta Social', description: 'Indique 5 pessoas', points: 500, icon: '🦋' },
    { id: 'influencer_frank', name: '🌟 Influencer Frank', description: 'Indique 10 pessoas', points: 1000, icon: '🌟' },
    { id: 'ambassador', name: '🎖️ Embaixador da Garagem', description: 'Indique 25 pessoas', points: 2500, icon: '🎖️' },
    { id: 'viral_legend', name: '🚀 Lenda Viral', description: 'Indique 50 pessoas', points: 5000, icon: '🚀' },

    // CONQUISTAS ESPECIAIS (4)
    { id: 'comeback_kid', name: '🔄 Eterno Retorno', description: 'Volte após 7 dias sem jogar', points: 100, icon: '🔄' },
    { id: 'night_owl', name: '🦉 Coruja da Madrugada', description: 'Jogue entre 00:00 e 06:00', points: 75, icon: '🦉' },
    { id: 'early_bird', name: '🐓 Madrugador', description: 'Jogue entre 05:00 e 08:00', points: 50, icon: '🐓' },
    { id: 'weekend_warrior', name: '🎉 Guerreiro do Fim de Semana', description: 'Jogue sábado e domingo', points: 100, icon: '🎉' },

    // CONQUISTAS DE PONTUAÇÃO (4)
    { id: 'points_1k', name: '💰 Primeiro Mil', description: 'Alcance 1.000 pontos', points: 100, icon: '💰' },
    { id: 'points_5k', name: '💎 Cinco Mil', description: 'Alcance 5.000 pontos', points: 250, icon: '💎' },
    { id: 'points_10k', name: '🏆 Dez Mil', description: 'Alcance 10.000 pontos', points: 500, icon: '🏆' },
    { id: 'points_25k', name: '👑 Vinte e Cinco Mil', description: 'Alcance 25.000 pontos', points: 1000, icon: '👑' }
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar nicks registrados
    loadRegisteredNicks();
    
    // Verificar se já tem jogador cadastrado
    const savedPlayer = localStorage.getItem('frankturbo_player');
    if (savedPlayer) {
        currentPlayer = JSON.parse(savedPlayer);
        hideSignupModal();
        initializeGame();
    } else {
        showSignupModal();
    }
    
    // Event listeners
    signupForm.addEventListener('submit', handleSignup);
    changePlayerBtn.addEventListener('click', showSignupModal);
    startButton.addEventListener('click', handleStartButtonClick);
    refreshRankingBtn.addEventListener('click', loadGlobalRanking);
    document.addEventListener('keydown', handleKeyPress);
    
    // Nick validation
    playerNickInput.addEventListener('input', debounce(validateNick, 500));
    playerNickInput.addEventListener('blur', validateNick);
    
    // Instagram formatting
    playerInstagramInput.addEventListener('input', formatInstagram);
    
    // Monitorar conexão
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Atualizar status de conexão
    updateConnectionStatus();
    setInterval(updateConnectionStatus, 5000);
    
    // Sincronizar dados offline
    syncOfflineData();
    setInterval(syncOfflineData, 30000);
});

// Google Sign-In
function handleGoogleSignIn(response) {
    const payload = JSON.parseFromString(atob(response.credential.split('.')[1]));
    
    // Preencher dados do Google
    playerNameInput.value = payload.name;
    
    // Sugerir nick baseado no nome
    const suggestedNick = generateNickFromName(payload.name);
    playerNickInput.value = suggestedNick;
    validateNick();
    
    // Salvar dados do Google
    currentPlayer.googleAccount = {
        email: payload.email,
        picture: payload.picture,
        verified: payload.email_verified
    };
    
    // Focar no campo de nick
    playerNickInput.focus();
}

function generateNickFromName(name) {
    // Gerar nick baseado no nome
    const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 15);
    
    return cleanName || 'piloto';
}

// Validação de nick
function validateNick() {
    const nick = playerNickInput.value.trim();
    const btnText = startGameBtn.querySelector('.btn-text');
    const btnLoader = startGameBtn.querySelector('.btn-loader');
    
    if (!nick) {
        nickStatus.innerHTML = '';
        startGameBtn.disabled = true;
        btnText.textContent = 'DIGITE UM NICK';
        btnLoader.style.display = 'none';
        return;
    }
    
    // Validar formato
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nick)) {
        nickStatus.innerHTML = '<span class="nick-error">❌ Use apenas letras, números e _ (3-20 caracteres)</span>';
        startGameBtn.disabled = true;
        btnText.textContent = 'NICK INVÁLIDO';
        btnLoader.style.display = 'none';
        return;
    }
    
    // Mostrar loading
    nickStatus.innerHTML = '<span class="nick-checking">🔄 Verificando disponibilidade...</span>';
    startGameBtn.disabled = true;
    btnText.textContent = 'VERIFICANDO...';
    btnLoader.style.display = 'inline-block';
    
    // Verificar se já existe
    checkNickAvailability(nick);
}

function checkNickAvailability(nick) {
    const btnText = startGameBtn.querySelector('.btn-text');
    const btnLoader = startGameBtn.querySelector('.btn-loader');
    
    // Simular verificação no servidor (será implementado com Google Sheets)
    setTimeout(() => {
        const isAvailable = !registeredNicks.has(nick.toLowerCase());
        
        if (isAvailable) {
            nickStatus.innerHTML = '<span class="nick-available">✅ Nick disponível!</span>';
            startGameBtn.disabled = false;
            btnText.textContent = 'COMEÇE O JOGO! 🏁';
            btnLoader.style.display = 'none';
        } else {
            nickStatus.innerHTML = `<span class="nick-taken">❌ Nick já existe. Tente: ${generateAlternativeNicks(nick).join(', ')}</span>`;
            startGameBtn.disabled = true;
            btnText.textContent = 'NICK JÁ EXISTE';
            btnLoader.style.display = 'none';
        }
    }, 800);
}

function generateAlternativeNicks(nick) {
    const alternatives = [];
    for (let i = 2; i <= 4; i++) {
        const alternative = `${nick}_${i}`;
        if (!registeredNicks.has(alternative.toLowerCase())) {
            alternatives.push(alternative);
        }
    }
    
    if (alternatives.length === 0) {
        const randomSuffix = Math.floor(Math.random() * 999) + 100;
        alternatives.push(`${nick}_${randomSuffix}`);
    }
    
    return alternatives.slice(0, 3);
}

function formatInstagram(event) {
    let value = event.target.value;
    
    // Remover caracteres especiais exceto @
    value = value.replace(/[^a-zA-Z0-9@._]/g, '');
    
    // Garantir que comece com @ se não estiver vazio
    if (value && !value.startsWith('@')) {
        value = '@' + value.replace('@', '');
    }
    
    // Limitar tamanho
    if (value.length > 31) { // @ + 30 caracteres max do Instagram
        value = value.substring(0, 31);
    }
    
    event.target.value = value;
}

function loadRegisteredNicks() {
    // Carregar nicks já registrados (será implementado com Google Sheets)
    // Por enquanto, simular alguns nicks
    registeredNicks = new Set([
        'frank', 'frank_turbo', 'garagem_frank', 'piloto_pro', 'speed_demon',
        'turbo_master', 'frank_oficial', 'garagem_oficial'
    ]);
}

// Funções do modal de cadastro
function showSignupModal() {
    signupModal.style.display = 'flex';
    signupForm.reset();
    nickStatus.innerHTML = '';
    startGameBtn.disabled = true;
    startGameBtn.querySelector('.btn-text').textContent = 'DIGITE UM NICK';
    startGameBtn.querySelector('.btn-loader').style.display = 'none';
    
    // Remover classe de erro se existir
    playerNickInput.classList.remove('error-blink');
}

function hideSignupModal() {
    signupModal.style.display = 'none';
}

function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(signupForm);
    const nick = formData.get('nick').trim();
    const name = formData.get('name').trim();
    
    // Verificar se nome foi preenchido
    if (!name) {
        alert('Por favor, preencha seu nome!');
        playerNameInput.focus();
        return;
    }
    
    // Verificação final do nick
    if (registeredNicks.has(nick.toLowerCase())) {
        // Nick já existe - piscar campo em vermelho e focar
        playerNickInput.classList.add('error-blink');
        playerNickInput.focus();
        nickStatus.innerHTML = '<span class="nick-taken">❌ Este nick já está em uso! Escolha outro.</span>';
        
        // Remover animação após 2 segundos
        setTimeout(() => {
            playerNickInput.classList.remove('error-blink');
        }, 2000);
        
        return;
    }
    
    currentPlayer = {
        name: name,
        nick: nick,
        instagram: formData.get('instagram') || '',
        howFound: formData.get('howFound') || '',
        totalGames: 0,
        personalBest: null,
        points: 0,
        achievements: [],
        registeredAt: new Date().toISOString(),
        googleAccount: currentPlayer.googleAccount || null
    };
    
    // Adicionar nick à lista de registrados
    registeredNicks.add(nick.toLowerCase());
    
    // Conquista de Instagram
    if (currentPlayer.instagram) {
        unlockAchievement('instagram_connected');
    }
    
    // Salvar jogador
    localStorage.setItem('frankturbo_player', JSON.stringify(currentPlayer));
    
    // Enviar dados de cadastro
    sendPlayerRegistration();
    
    // IR DIRETO PARA O JOGO - SEM DUPLO CLIQUE
    hideSignupModal();
    initializeGame();
    
    // Analytics
    gtag('event', 'player_registration', {
        'custom_parameter': currentPlayer.nick
    });
}

function initializeGame() {
    loadPlayerData();
    updatePlayerDisplay();
    updateTimesDisplay();
    updateAchievements();
    loadGlobalRanking();
    initializeDailyChallenge();
}

// Funções do jogador
function loadPlayerData() {
    const savedBestTimes = localStorage.getItem('frankturbo_bestTimes_' + currentPlayer.nick);
    const savedLastTimes = localStorage.getItem('frankturbo_lastTimes_' + currentPlayer.nick);
    const savedPlayer = localStorage.getItem('frankturbo_player');
    
    if (savedBestTimes) {
        bestTimes = JSON.parse(savedBestTimes);
    }
    
    if (savedLastTimes) {
        lastTimes = JSON.parse(savedLastTimes);
    }
    
    if (savedPlayer) {
        const playerData = JSON.parse(savedPlayer);
        currentPlayer = { ...currentPlayer, ...playerData };
    }
}

function updatePlayerDisplay() {
    playerNameDisplay.textContent = currentPlayer.name;
    playerNickDisplay.textContent = '@' + currentPlayer.nick;
    totalGamesSpan.textContent = currentPlayer.totalGames;
    personalBestSpan.textContent = currentPlayer.personalBest ? currentPlayer.personalBest.toFixed(3) + 's' : '--';
    playerPointsSpan.textContent = currentPlayer.points;
    
    // Simular posição global (será implementado com dados reais)
    const position = Math.floor(Math.random() * 100) + 1;
    globalPositionSpan.textContent = '#' + position;
}

function savePlayerData() {
    localStorage.setItem('frankturbo_player', JSON.stringify(currentPlayer));
    localStorage.setItem('frankturbo_bestTimes_' + currentPlayer.nick, JSON.stringify(bestTimes));
    localStorage.setItem('frankturbo_lastTimes_' + currentPlayer.nick, JSON.stringify(lastTimes));
}

// [Resto das funções do jogo permanecem iguais...]
// Copiando as funções principais do jogo do arquivo anterior

function handleStartButtonClick() {
    if (gameState === 'idle') {
        startRace();
    } else if (gameState === 'ready') {
        recordReaction();
    } else if (gameState === 'finished') {
        resetGame();
    }
}

function handleKeyPress(event) {
    if ((event.code === 'Space' || event.code === 'Enter') && 
        (gameState === 'idle' || gameState === 'ready' || gameState === 'finished')) {
        event.preventDefault();
        handleStartButtonClick();
    }
}

function startRace() {
    gameState = 'staging';
    statusMessage.textContent = 'Preparando...';
    timeDisplay.textContent = '0.000';
    timeDisplay.classList.remove('negative');
    startButton.textContent = 'AGUARDE';
    
    resetLights();
    
    setTimeout(() => {
        preStage1Left.classList.add('active');
        preStage1Right.classList.add('active');
        preStage2Left.classList.add('active');
        preStage2Right.classList.add('active');
    }, 500);
    
    setTimeout(() => {
        stage1Left.classList.add('active');
        stage1Right.classList.add('active');
        stage2Left.classList.add('active');
        stage2Right.classList.add('active');
        statusMessage.textContent = 'Pronto...';
    }, 1500);
    
    setTimeout(() => {
        gameState = 'countdown';
        startAmberSequence();
    }, 2500);
}

function startAmberSequence() {
    statusMessage.textContent = 'Atenção!';
    
    const amberLights = [
        [amber1Left, amber1Right],
        [amber2Left, amber2Right],
        [amber3Left, amber3Right]
    ];
    
    for (let i = 0; i < amberLights.length; i++) {
        countdownTimers.push(setTimeout(() => {
            amberLights[i][0].classList.add('active');
            amberLights[i][1].classList.add('active');
            
            if (i === amberLights.length - 1) {
                const randomDelay = Math.floor(Math.random() * 700) + 300;
                greenLightTimer = setTimeout(() => {
                    if (gameState === 'countdown') {
                        greenLeft.classList.add('active');
                        greenRight.classList.add('active');
                        startTime = Date.now();
                        gameState = 'ready';
                        statusMessage.textContent = 'VÁ!';
                        startButton.textContent = 'CLIQUE!';
                    }
                }, randomDelay);
            }
        }, 400 * (i + 1)));
    }
    
    setTimeout(() => {
        document.addEventListener('click', checkFalseStart);
        document.addEventListener('keydown', checkFalseStartKey);
    }, 400);
}

function checkFalseStart(event) {
    if (gameState === 'countdown' && event.target === startButton) {
        falseStartTime = Date.now();
        falseLaunch();
    }
}

function checkFalseStartKey(event) {
    if (gameState === 'countdown' && (event.code === 'Space' || event.code === 'Enter')) {
        falseStartTime = Date.now();
        falseLaunch();
    }
}

function falseLaunch() {
    gameState = 'finished';
    clearAllTimers();
    
    redLeft.classList.add('active');
    redRight.classList.add('active');
    
    const estimatedGreenTime = Date.now() + 650;
    const falseStartDiff = (falseStartTime - estimatedGreenTime) / 1000;
    const formattedTime = falseStartDiff.toFixed(3);
    
    timeDisplay.textContent = formattedTime;
    timeDisplay.classList.add('negative');
    statusMessage.textContent = 'Largada queimada!';
    startButton.textContent = 'TENTAR NOVAMENTE';
    
    document.removeEventListener('click', checkFalseStart);
    document.removeEventListener('keydown', checkFalseStartKey);
    
    recordTime(formattedTime, true);
    unlockAchievement('false_start');
    
    gtag('event', 'false_start', {
        'custom_parameter': formattedTime
    });
}

function recordReaction() {
    if (gameState !== 'ready') return;
    
    gameState = 'finished';
    const endTime = Date.now();
    reactionTime = (endTime - startTime) / 1000;
    
    const formattedTime = reactionTime.toFixed(3);
    timeDisplay.textContent = formattedTime;
    
    if (reactionTime < 0.02) {
        statusMessage.textContent = 'Tempo impossível! Você trapaceou?';
    } else if (reactionTime < 0.1) {
        statusMessage.textContent = 'Incrível! Reação de piloto profissional!';
    } else if (reactionTime < 0.2) {
        statusMessage.textContent = 'Excelente! Reação de elite!';
    } else if (reactionTime < 0.3) {
        statusMessage.textContent = 'Muito bom! Reação rápida!';
    } else {
        statusMessage.textContent = 'Bom tempo! Continue praticando!';
    }
    
    startButton.textContent = 'NOVA CORRIDA';
    
    recordTime(formattedTime, false);
    checkTimeAchievements(reactionTime);
    
    document.removeEventListener('click', checkFalseStart);
    document.removeEventListener('keydown', checkFalseStartKey);
    
    gtag('event', 'reaction_time', {
        'value': reactionTime,
        'custom_parameter': formattedTime
    });
}

function recordTime(time, isNegative) {
    currentPlayer.totalGames++;
    
    // Calcular pontuação com novo sistema
    const scoreResult = calculateScore(time, isNegative);
    
    if (!isNegative) {
        const timeFloat = parseFloat(time);
        
        // Verificar recorde pessoal
        const isPersonalRecord = !currentPlayer.personalBest || timeFloat < currentPlayer.personalBest;
        if (isPersonalRecord) {
            currentPlayer.personalBest = timeFloat;
            scoreResult.bonusPoints += 200; // Bônus recorde pessoal
            scoreResult.bonusReasons.push('🏆 Novo recorde pessoal! +200');
            
            // Mostrar animação épica de recorde
            const worldRanking = calculateWorldRanking(time);
            showPersonalRecordAnimation(time, worldRanking);
        }
        
        // Aplicar pontuação com animação
        const oldPoints = currentPlayer.points;
        currentPlayer.points += scoreResult.totalPoints;
        
        // Mostrar animação de pontuação
        showPointsAnimation(oldPoints, currentPlayer.points, scoreResult.totalPoints);
        
        // Mostrar popup de pontuação detalhada
        setTimeout(() => {
            showScorePopup(scoreResult);
        }, 1000); // Após animação de pontos
        
        // Verificar se é tempo ÉPICO para compartilhamento (< 0.050s)
        if (timeFloat < 0.050) {
            const worldRanking = calculateWorldRanking(time);
            setTimeout(() => {
                showSharePopup(time, worldRanking);
            }, 3500); // Após o popup de pontuação
        }
        
    } else {
        // Penalidade por queimada com animação
        const oldPoints = currentPlayer.points;
        currentPlayer.points += scoreResult.totalPoints; // Já vem negativo
        
        // Mostrar animação de pontuação negativa
        showPointsAnimation(oldPoints, currentPlayer.points, scoreResult.totalPoints);
        
        // Mostrar popup de pontuação detalhada
        setTimeout(() => {
            showScorePopup(scoreResult);
        }, 1000); // Após animação de pontos
    }
    
    // Inicializar dados de sessão se não existir
    if (!currentPlayer.sessionData) {
        currentPlayer.sessionData = {
            gamesPlayed: 0,
            sessionScore: 0,
            consecutiveGoodTimes: 0,
            bestSessionTime: null,
            startTime: new Date().toISOString()
        };
    }
    
    // Sistema de pontuação diária (8:00 às 07:59)
    checkAndResetDailyPoints();
    
    // Aplicar pontos diários
    if (!currentPlayer.dailyPoints) {
        currentPlayer.dailyPoints = {
            points: 0,
            date: getCurrentDailyDate(),
            resetTime: getNextResetTime()
        };
    }
    
    currentPlayer.dailyPoints.points += scoreResult.totalPoints;
    
    // Atualizar recordes diários
    updateDailyRecords(time, scoreResult.totalPoints, isNegative);
    
    if (!isNegative) {
        const timeFloat = parseFloat(time);
        if (!currentPlayer.sessionData.bestSessionTime || timeFloat < currentPlayer.sessionData.bestSessionTime) {
            currentPlayer.sessionData.bestSessionTime = timeFloat;
        }
        
        // Verificar sequência de bons tempos
        if (timeFloat < 0.300) {
            currentPlayer.sessionData.consecutiveGoodTimes++;
        } else {
            currentPlayer.sessionData.consecutiveGoodTimes = 0;
        }
    } else {
        currentPlayer.sessionData.consecutiveGoodTimes = 0;
    }
    
    // Verificar todas as conquistas
    checkTimeAchievements(time, isNegative);
    
    lastTimes.unshift({time: time, isNegative: isNegative, timestamp: new Date().toISOString()});
    if (lastTimes.length > 5) {
        lastTimes.pop();
    }
    
    if (!isNegative) {
        bestTimes.push(parseFloat(time));
        bestTimes.sort((a, b) => a - b);
        if (bestTimes.length > 5) {
            bestTimes.pop();
        }
    }
    
    savePlayerData();
    updatePlayerDisplay();
    updateTimesDisplay();
    updateAchievements();
    sendGameData(time, isNegative);
    updateDailyChallenge(time, isNegative);
}

function checkTimeAchievements(time) {
    if (time < 0.300) unlockAchievement('sub_300');
    if (time < 0.200) unlockAchievement('sub_200');
    if (time < 0.150) unlockAchievement('sub_150');
}

// Sistema de pontuação avançado
function calculateScore(time, isNegative) {
    const result = {
        basePoints: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        multiplier: 1,
        totalPoints: 0,
        bonusReasons: []
    };
    
    if (isNegative) {
        result.penaltyPoints = -50;
        result.totalPoints = -50;
        result.bonusReasons.push('❌ Queimada: -50 pontos');
        return result;
    }
    
    const timeFloat = parseFloat(time);
    
    // Pontuação base por tempo
    if (timeFloat < 0.100) {
        result.basePoints = 1000;
        result.bonusPoints += 500;
        result.bonusReasons.push('🚀 Sub 0.100s: +500 bônus!');
    } else if (timeFloat < 0.150) {
        result.basePoints = Math.round(800 - (timeFloat - 0.100) * 6000);
        result.bonusPoints += 100;
        result.bonusReasons.push('⚡ Sub 0.150s: +100 bônus!');
    } else if (timeFloat < 0.200) {
        result.basePoints = Math.round(500 - (timeFloat - 0.150) * 4000);
    } else if (timeFloat < 0.300) {
        result.basePoints = Math.round(300 - (timeFloat - 0.200) * 2000);
    } else if (timeFloat < 0.400) {
        result.basePoints = Math.round(100 - (timeFloat - 0.300) * 500);
    } else {
        result.basePoints = Math.max(25, Math.round(50 - (timeFloat - 0.400) * 100));
    }
    
    // Multiplicadores por sequência
    if (currentPlayer.sessionData && currentPlayer.sessionData.consecutiveGoodTimes >= 10) {
        result.multiplier = 2.0;
        result.bonusReasons.push('🔥 Sequência de 10: x2.0!');
    } else if (currentPlayer.sessionData && currentPlayer.sessionData.consecutiveGoodTimes >= 5) {
        result.multiplier = 1.5;
        result.bonusReasons.push('🔥 Sequência de 5: x1.5!');
    } else if (currentPlayer.sessionData && currentPlayer.sessionData.consecutiveGoodTimes >= 3) {
        result.multiplier = 1.2;
        result.bonusReasons.push('🔥 Sequência de 3: x1.2!');
    }
    
    // Bônus tempo perfeito
    if (timeFloat >= 0.080 && timeFloat <= 0.120) {
        result.bonusPoints += 1000;
        result.bonusReasons.push('🎯 Tempo perfeito: +1000!');
    }
    
    result.totalPoints = Math.round((result.basePoints + result.bonusPoints) * result.multiplier + result.penaltyPoints);
    
    return result;
}

function showScorePopup(scoreResult) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    let bonusText = '';
    if (scoreResult.bonusReasons.length > 0) {
        bonusText = scoreResult.bonusReasons.map(reason => `<div class="bonus-reason">${reason}</div>`).join('');
    }
    
    popup.innerHTML = `
        <div class="score-content">
            <div class="score-main">+${scoreResult.totalPoints}</div>
            <div class="score-breakdown">
                <div>Base: ${scoreResult.basePoints}</div>
                ${scoreResult.bonusPoints > 0 ? `<div>Bônus: +${scoreResult.bonusPoints}</div>` : ''}
                ${scoreResult.multiplier > 1 ? `<div>Multiplicador: x${scoreResult.multiplier}</div>` : ''}
            </div>
            ${bonusText}
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

// Animação épica de recorde pessoal
function showPersonalRecordAnimation(time, worldRanking) {
    const overlay = document.createElement('div');
    overlay.className = 'record-overlay';
    
    overlay.innerHTML = `
        <div class="record-animation">
            <div class="record-fireworks"></div>
            <div class="record-content">
                <div class="record-title">🏆 NOVO RECORDE PESSOAL! 🏆</div>
                <div class="record-time">${time}s</div>
                <div class="record-ranking">
                    <div class="ranking-label">POSIÇÃO MUNDIAL</div>
                    <div class="ranking-position">#${worldRanking}</div>
                </div>
                <div class="record-subtitle">Você está entre os melhores pilotos!</div>
            </div>
            <div class="record-particles"></div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Criar partículas
    createFireworks(overlay.querySelector('.record-fireworks'));
    createParticles(overlay.querySelector('.record-particles'));
    
    // Som de celebração (se disponível)
    playRecordSound();
    
    // Remover após 5 segundos
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 1000);
    }, 5000);
}

function createFireworks(container) {
    for (let i = 0; i < 20; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = Math.random() * 100 + '%';
        firework.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(firework);
    }
}

function createParticles(container) {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(particle);
    }
}

function playRecordSound() {
    // Implementar som de celebração se necessário
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {}); // Ignorar erro se não conseguir tocar
    } catch (e) {
        // Ignorar erro de áudio
    }
}

function calculateWorldRanking(time) {
    // Simular ranking mundial baseado no tempo
    const timeFloat = parseFloat(time);
    
    if (timeFloat < 0.080) return Math.floor(Math.random() * 10) + 1; // Top 10
    if (timeFloat < 0.100) return Math.floor(Math.random() * 50) + 11; // Top 60
    if (timeFloat < 0.120) return Math.floor(Math.random() * 100) + 61; // Top 160
    if (timeFloat < 0.150) return Math.floor(Math.random() * 500) + 161; // Top 660
    if (timeFloat < 0.200) return Math.floor(Math.random() * 1000) + 661; // Top 1660
    if (timeFloat < 0.250) return Math.floor(Math.random() * 2000) + 1661; // Top 3660
    if (timeFloat < 0.300) return Math.floor(Math.random() * 5000) + 3661; // Top 8660
    
    return Math.floor(Math.random() * 10000) + 8661; // Resto
}

function checkTimeAchievements(time, isNegative) {
    const timeFloat = parseFloat(time);
    
    if (!isNegative) {
        // Conquistas de velocidade
        if (timeFloat < 0.500) unlockAchievement('sub_500');
        if (timeFloat < 0.400) unlockAchievement('sub_400');
        if (timeFloat < 0.300) unlockAchievement('sub_300');
        if (timeFloat < 0.250) unlockAchievement('sub_250');
        if (timeFloat < 0.200) unlockAchievement('sub_200');
        if (timeFloat < 0.150) unlockAchievement('sub_150');
        if (timeFloat < 0.120) unlockAchievement('sub_120');
        if (timeFloat < 0.100) unlockAchievement('sub_100');
        if (timeFloat < 0.080) unlockAchievement('sub_080');
        if (timeFloat < 0.060) unlockAchievement('sub_060');
        
        // Conquistas ruins/engraçadas
        if (timeFloat > 1.000) unlockAchievement('turtle_speed');
        if (timeFloat > 2.000) unlockAchievement('sleepy_driver');
        if (timeFloat > 3.000) unlockAchievement('snail_champion');
        if (timeFloat > 5.000) unlockAchievement('patience_tester');
        if (timeFloat > 10.000) unlockAchievement('statue_mode');
        
        // Verificar consistência
        checkConsistencyAchievements(timeFloat);
        
        // Reset contador de queimadas consecutivas
        if (currentPlayer.burnoutTracker) {
            currentPlayer.burnoutTracker.consecutiveBurnouts = 0;
        }
    } else {
        // Conquistas de queimada
        checkBurnoutAchievements();
    }
    
    // Verificar conquistas de dedicação
    checkDedicationAchievements();
    
    // Verificar conquistas especiais
    checkSpecialAchievements();
    
    // Verificar conquistas de pontuação
    checkPointsAchievements();
    
    // Verificar primeira jogada
    if (currentPlayer.totalGames === 1) {
        unlockAchievement('first_timer');
    }
}

function checkConsistencyAchievements(timeFloat) {
    if (!currentPlayer.consistencyTracker) {
        currentPlayer.consistencyTracker = {
            consecutive300: 0,
            consecutive250: 0,
            consecutive200: 0,
            consecutive100: 0,
            consecutiveNoBurnout: 0,
            sessionNoBurnout: 0
        };
    }
    
    const tracker = currentPlayer.consistencyTracker;
    
    // Verificar sequências de tempo
    if (timeFloat < 0.300) {
        tracker.consecutive300++;
        if (tracker.consecutive300 >= 3) unlockAchievement('consistent_3');
    } else {
        tracker.consecutive300 = 0;
    }
    
    if (timeFloat < 0.250) {
        tracker.consecutive250++;
        if (tracker.consecutive250 >= 5) unlockAchievement('consistent_5');
    } else {
        tracker.consecutive250 = 0;
    }
    
    if (timeFloat < 0.200) {
        tracker.consecutive200++;
        if (tracker.consecutive200 >= 10) unlockAchievement('consistent_10');
        if (tracker.consecutive200 >= 15) unlockAchievement('consistent_15');
    } else {
        tracker.consecutive200 = 0;
    }
    
    if (timeFloat < 0.100) {
        tracker.consecutive100++;
        if (tracker.consecutive100 >= 5) unlockAchievement('consistent_pro');
    } else {
        tracker.consecutive100 = 0;
    }
    
    // Verificar sequências sem queimar
    tracker.consecutiveNoBurnout++;
    tracker.sessionNoBurnout++;
    
    if (tracker.consecutiveNoBurnout >= 10) unlockAchievement('no_burnout_10');
    if (tracker.consecutiveNoBurnout >= 25) unlockAchievement('no_burnout_25');
    if (tracker.sessionNoBurnout >= 10) unlockAchievement('perfect_session');
}

function checkBurnoutAchievements() {
    if (!currentPlayer.burnoutTracker) {
        currentPlayer.burnoutTracker = {
            totalBurnouts: 0,
            consecutiveBurnouts: 0
        };
    }
    
    const tracker = currentPlayer.burnoutTracker;
    tracker.totalBurnouts++;
    tracker.consecutiveBurnouts++;
    
    // Reset contadores de consistência
    if (currentPlayer.consistencyTracker) {
        currentPlayer.consistencyTracker.consecutiveNoBurnout = 0;
        currentPlayer.consistencyTracker.sessionNoBurnout = 0;
    }
    
    // Conquistas de queimada
    if (tracker.totalBurnouts === 1) unlockAchievement('first_burnout');
    if (tracker.totalBurnouts >= 5) unlockAchievement('burnout_5');
    if (tracker.totalBurnouts >= 25) unlockAchievement('burnout_king');
    if (tracker.totalBurnouts >= 50) unlockAchievement('burnout_legend');
    
    if (tracker.consecutiveBurnouts >= 5) unlockAchievement('consecutive_burnouts');
}

function checkDedicationAchievements() {
    const totalGames = currentPlayer.totalGames;
    
    if (totalGames >= 10) unlockAchievement('garage_visitor');
    if (totalGames >= 50) unlockAchievement('garage_regular');
    if (totalGames >= 100) unlockAchievement('garage_veteran');
    if (totalGames >= 250) unlockAchievement('garage_master');
    if (totalGames >= 500) unlockAchievement('garage_legend');
    
    // Verificar dias consecutivos
    checkDailyStreak();
}

function checkSpecialAchievements() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = domingo, 6 = sábado
    
    // Conquistas de horário
    if (hour >= 0 && hour < 6) unlockAchievement('night_owl');
    if (hour >= 5 && hour < 8) unlockAchievement('early_bird');
    
    // Conquista de fim de semana
    if (day === 0 || day === 6) {
        if (!currentPlayer.weekendTracker) {
            currentPlayer.weekendTracker = { saturday: false, sunday: false };
        }
        
        if (day === 6) currentPlayer.weekendTracker.saturday = true;
        if (day === 0) currentPlayer.weekendTracker.sunday = true;
        
        if (currentPlayer.weekendTracker.saturday && currentPlayer.weekendTracker.sunday) {
            unlockAchievement('weekend_warrior');
        }
    } else {
        // Reset no início da semana
        if (day === 1) currentPlayer.weekendTracker = { saturday: false, sunday: false };
    }
}

function checkPointsAchievements() {
    const points = currentPlayer.points;
    
    if (points >= 1000) unlockAchievement('points_1k');
    if (points >= 5000) unlockAchievement('points_5k');
    if (points >= 10000) unlockAchievement('points_10k');
    if (points >= 25000) unlockAchievement('points_25k');
}

function checkDailyStreak() {
    const today = getCurrentDailyDate();
    
    if (!currentPlayer.dailyStreak) {
        currentPlayer.dailyStreak = {
            lastPlayDate: today,
            currentStreak: 1,
            maxStreak: 1
        };
    }
    
    const streak = currentPlayer.dailyStreak;
    const lastDate = new Date(streak.lastPlayDate);
    const currentDate = new Date(today);
    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
        // Dia consecutivo
        streak.currentStreak++;
        streak.lastPlayDate = today;
        
        if (streak.currentStreak > streak.maxStreak) {
            streak.maxStreak = streak.currentStreak;
        }
        
        if (streak.currentStreak >= 7) {
            unlockAchievement('daily_warrior');
        }
    } else if (daysDiff > 1) {
        // Quebrou a sequência
        if (daysDiff >= 7) {
            unlockAchievement('comeback_kid');
        }
        
        streak.currentStreak = 1;
        streak.lastPlayDate = today;
    }
    // daysDiff === 0 = mesmo dia, não faz nada
}

// Sistema de pontuação diária (8:00 às 07:59)
function getCurrentDailyDate() {
    const now = new Date();
    const hour = now.getHours();
    
    // Se for antes das 8:00, considera o dia anterior
    if (hour < 8) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toDateString();
    }
    
    return now.toDateString();
}

function getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    
    if (now.getHours() >= 8) {
        tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString();
}

function checkAndResetDailyPoints() {
    if (!currentPlayer.dailyPoints) return;
    
    const currentDate = getCurrentDailyDate();
    
    if (currentPlayer.dailyPoints.date !== currentDate) {
        // Verificar prêmios antes de resetar
        checkDailyPrizes();
        
        // Reset pontuação diária
        currentPlayer.dailyPoints = {
            points: 0,
            date: currentDate,
            resetTime: getNextResetTime()
        };
        
        // Reset recordes diários
        if (!currentPlayer.dailyRecords) {
            currentPlayer.dailyRecords = {};
        }
        
        currentPlayer.dailyRecords[currentDate] = {
            bestTime: null,
            worstTime: null,
            totalPoints: 0,
            gamesPlayed: 0
        };
    }
}

function updateDailyRecords(time, points, isNegative) {
    const currentDate = getCurrentDailyDate();
    
    if (!currentPlayer.dailyRecords) {
        currentPlayer.dailyRecords = {};
    }
    
    if (!currentPlayer.dailyRecords[currentDate]) {
        currentPlayer.dailyRecords[currentDate] = {
            bestTime: null,
            worstTime: null,
            totalPoints: 0,
            gamesPlayed: 0
        };
    }
    
    const dayRecord = currentPlayer.dailyRecords[currentDate];
    
    if (!isNegative) {
        const timeFloat = parseFloat(time);
        
        // Melhor tempo
        if (!dayRecord.bestTime || timeFloat < dayRecord.bestTime) {
            dayRecord.bestTime = timeFloat;
        }
        
        // Pior tempo (só tempos válidos)
        if (!dayRecord.worstTime || timeFloat > dayRecord.worstTime) {
            dayRecord.worstTime = timeFloat;
        }
    }
    
    dayRecord.totalPoints += points;
    dayRecord.gamesPlayed++;
    
    // Salvar no ranking global diário
    saveDailyGlobalRanking(currentDate, currentPlayer.nick, dayRecord);
}

function saveDailyGlobalRanking(date, nick, record) {
    let globalRanking = JSON.parse(localStorage.getItem('dailyGlobalRanking') || '{}');
    
    if (!globalRanking[date]) {
        globalRanking[date] = {
            bestTime: { nick: null, time: null },
            worstTime: { nick: null, time: null },
            mostPoints: { nick: null, points: 0 }
        };
    }
    
    const dayRanking = globalRanking[date];
    
    // Melhor tempo global
    if (record.bestTime && (!dayRanking.bestTime.time || record.bestTime < dayRanking.bestTime.time)) {
        dayRanking.bestTime = { nick: nick, time: record.bestTime };
    }
    
    // Pior tempo global
    if (record.worstTime && (!dayRanking.worstTime.time || record.worstTime > dayRanking.worstTime.time)) {
        dayRanking.worstTime = { nick: nick, time: record.worstTime };
    }
    
    // Mais pontos global
    if (record.totalPoints > dayRanking.mostPoints.points) {
        dayRanking.mostPoints = { nick: nick, points: record.totalPoints };
    }
    
    localStorage.setItem('dailyGlobalRanking', JSON.stringify(globalRanking));
}

function checkDailyPrizes() {
    const yesterday = getCurrentDailyDate();
    const globalRanking = JSON.parse(localStorage.getItem('dailyGlobalRanking') || '{}');
    
    if (!globalRanking[yesterday]) return;
    
    const dayRanking = globalRanking[yesterday];
    const playerNick = currentPlayer.nick;
    
    // Verificar se ganhou algum prêmio
    let prizes = [];
    
    if (dayRanking.bestTime.nick === playerNick) {
        prizes.push({
            type: 'bestTime',
            title: '🏆 MELHOR TEMPO DO DIA!',
            description: `Você teve o melhor tempo: ${dayRanking.bestTime.time}s`,
            reward: 1000
        });
    }
    
    if (dayRanking.worstTime.nick === playerNick) {
        prizes.push({
            type: 'worstTime',
            title: '🎭 PIOR TEMPO DO DIA!',
            description: `Você teve o pior tempo: ${dayRanking.worstTime.time}s (mas ganhou prêmio!)`,
            reward: 200
        });
    }
    
    if (dayRanking.mostPoints.nick === playerNick) {
        prizes.push({
            type: 'mostPoints',
            title: '💰 MAIS PONTOS DO DIA!',
            description: `Você fez mais pontos: ${dayRanking.mostPoints.points} pontos`,
            reward: 500
        });
    }
    
    // Mostrar prêmios
    if (prizes.length > 0) {
        showDailyPrizes(prizes);
    }
}

function showDailyPrizes(prizes) {
    const overlay = document.createElement('div');
    overlay.className = 'prizes-overlay';
    
    let prizesHTML = prizes.map(prize => `
        <div class="prize-item">
            <div class="prize-title">${prize.title}</div>
            <div class="prize-description">${prize.description}</div>
            <div class="prize-reward">+${prize.reward} pontos bônus!</div>
        </div>
    `).join('');
    
    overlay.innerHTML = `
        <div class="prizes-content">
            <div class="prizes-header">
                <h2>🎉 PRÊMIOS DIÁRIOS! 🎉</h2>
                <p>Você ganhou prêmios do dia anterior!</p>
            </div>
            <div class="prizes-list">
                ${prizesHTML}
            </div>
            <button class="prizes-close">Continuar</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Aplicar recompensas
    let totalReward = prizes.reduce((sum, prize) => sum + prize.reward, 0);
    currentPlayer.points += totalReward;
    
    // Event listener
    overlay.querySelector('.prizes-close').addEventListener('click', () => {
        overlay.remove();
        updatePlayerDisplay();
    });
}

// Animação de pontuação em tempo real
function showPointsAnimation(oldPoints, newPoints, changePoints) {
    const overlay = document.createElement('div');
    overlay.className = 'points-animation-overlay';
    
    const isPositive = changePoints > 0;
    const changeText = isPositive ? `+${changePoints}` : `${changePoints}`;
    const changeClass = isPositive ? 'positive' : 'negative';
    
    overlay.innerHTML = `
        <div class="points-animation">
            <div class="points-change ${changeClass}">${changeText}</div>
            <div class="points-counter">
                <span class="points-label">PONTOS TOTAIS:</span>
                <span class="points-value" data-start="${oldPoints}" data-end="${newPoints}">${oldPoints}</span>
            </div>
            <div class="daily-points-counter">
                <span class="daily-label">PONTOS HOJE:</span>
                <span class="daily-value">${currentPlayer.dailyPoints ? currentPlayer.dailyPoints.points : 0}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animar contador
    animateCounter(overlay.querySelector('.points-value'), oldPoints, newPoints, 1000);
    
    // Remover após animação
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    }, 2000);
}

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (difference * easeOut));
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Popup de compartilhamento para tempos épicos
function showSharePopup(time, worldRanking) {
    const popup = document.createElement('div');
    popup.className = 'share-popup';
    
    popup.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h2>🚀 TEMPO ÉPICO! 🚀</h2>
                <p>Compartilhe sua conquista no Instagram!</p>
            </div>
            
            <div class="share-preview">
                <canvas id="shareCanvas" width="1080" height="1080"></canvas>
            </div>
            
            <div class="share-buttons">
                <button id="downloadBtn" class="share-btn download">
                    📱 Baixar Imagem
                </button>
                <button id="shareBtn" class="share-btn share">
                    📸 Compartilhar
                </button>
                <button id="closeShareBtn" class="share-btn close">
                    ❌ Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Gerar imagem personalizada
    generateShareImage(time, worldRanking);
    
    // Event listeners
    document.getElementById('downloadBtn').addEventListener('click', downloadShareImage);
    document.getElementById('shareBtn').addEventListener('click', shareToInstagram);
    document.getElementById('closeShareBtn').addEventListener('click', () => {
        popup.remove();
    });
}

function generateShareImage(time, worldRanking) {
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(0.5, '#2d2d2d');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Logo da Garagem do Frank (simulado)
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('A GARAGEM DO FRANK', 540, 150);
    
    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.fillText('TEMPO ÉPICO!', 540, 280);
    
    // Tempo principal
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 120px Arial';
    ctx.fillText(`${time}s`, 540, 450);
    
    // Nome do jogador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial';
    ctx.fillText(`@${currentPlayer.nick}`, 540, 550);
    
    // Ranking mundial
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 60px Arial';
    ctx.fillText('POSIÇÃO MUNDIAL', 540, 650);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px Arial';
    ctx.fillText(`#${worldRanking}`, 540, 780);
    
    // Rodapé
    ctx.fillStyle = '#888888';
    ctx.font = '40px Arial';
    ctx.fillText('frankturbo.com.br', 540, 950);
    
    // Adicionar elementos visuais
    drawSpeedLines(ctx);
    drawTurboIcon(ctx);
}

function drawSpeedLines(ctx) {
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 10; i++) {
        const y = 200 + i * 80;
        const length = Math.random() * 200 + 100;
        
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(50 + length, y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(1030, y);
        ctx.lineTo(1030 - length, y);
        ctx.stroke();
    }
}

function drawTurboIcon(ctx) {
    // Desenhar ícone de turbo simplificado
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(540, 850, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('T', 540, 860);
}

function downloadShareImage() {
    const canvas = document.getElementById('shareCanvas');
    const link = document.createElement('a');
    link.download = `garagem-frank-${currentPlayer.nick}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function shareToInstagram() {
    const canvas = document.getElementById('shareCanvas');
    
    // Converter canvas para blob
    canvas.toBlob((blob) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'tempo-epico.png', { type: 'image/png' })] })) {
            // API nativa de compartilhamento (mobile)
            navigator.share({
                title: 'Tempo Épico - A Garagem do Frank',
                text: `Consegui ${currentPlayer.personalBest}s no simulador da Garagem do Frank! 🚀`,
                files: [new File([blob], 'tempo-epico.png', { type: 'image/png' })]
            });
        } else {
            // Fallback: baixar imagem
            downloadShareImage();
            alert('Imagem baixada! Agora você pode compartilhar no Instagram! 📸');
        }
    }, 'image/png');
}

function unlockAchievement(achievementId) {
    if (currentPlayer.achievements.includes(achievementId)) return;
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    currentPlayer.achievements.push(achievementId);
    currentPlayer.points += achievement.points;
    
    showAchievementNotification(achievement);
    savePlayerData();
    updatePlayerDisplay();
    updateAchievements();
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <span class="achievement-icon">${achievement.icon}</span>
            <div class="achievement-text">
                <div class="achievement-title">Conquista Desbloqueada!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-points">+${achievement.points} pontos</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateAchievements() {
    achievementsContainer.innerHTML = '';
    
    // Mostrar apenas conquistas desbloqueadas
    const unlockedAchievements = achievements.filter(achievement => 
        currentPlayer.achievements.includes(achievement.id)
    );
    
    if (unlockedAchievements.length === 0) {
        achievementsContainer.innerHTML = '<div class="no-achievements">🏆 Jogue para desbloquear conquistas!</div>';
        return;
    }
    
    unlockedAchievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement unlocked';
        achievementEl.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <span class="achievement-name">${achievement.name}</span>
            <span class="achievement-points">+${achievement.points}</span>
        `;
        achievementEl.title = achievement.description;
        achievementsContainer.appendChild(achievementEl);
    });
    
    // Mostrar contador de conquistas
    const totalAchievements = achievements.length;
    const unlockedCount = unlockedAchievements.length;
    const counterEl = document.createElement('div');
    counterEl.className = 'achievements-counter';
    counterEl.innerHTML = `
        <span class="counter-text">🏆 ${unlockedCount}/${totalAchievements} Conquistas Desbloqueadas</span>
    `;
    achievementsContainer.appendChild(counterEl);
}

function updateTimesDisplay() {
    bestTimesList.innerHTML = '';
    if (bestTimes.length === 0) {
        bestTimesList.innerHTML = '<li>Ainda sem registros</li>';
    } else {
        bestTimes.forEach(time => {
            const li = document.createElement('li');
            li.textContent = `${time.toFixed(3)}s`;
            bestTimesList.appendChild(li);
        });
    }
    
    lastTimesList.innerHTML = '';
    if (lastTimes.length === 0) {
        lastTimesList.innerHTML = '<li>Ainda sem registros</li>';
    } else {
        lastTimes.forEach(timeObj => {
            const li = document.createElement('li');
            if (timeObj.isNegative) {
                li.innerHTML = `<span class="negative-time">${timeObj.time}s</span> (Queimada)`;
            } else {
                li.textContent = `${timeObj.time}s`;
            }
            lastTimesList.appendChild(li);
        });
    }
}

function resetGame() {
    gameState = 'idle';
    resetLights();
    startButton.textContent = 'INICIAR CORRIDA';
    statusMessage.textContent = 'Aguardando início...';
    timeDisplay.textContent = '0.000';
    timeDisplay.classList.remove('negative');
}

function resetLights() {
    document.querySelectorAll('.light').forEach(light => {
        light.classList.remove('active');
    });
}

function clearAllTimers() {
    countdownTimers.forEach(timer => clearTimeout(timer));
    countdownTimers = [];
    if (greenLightTimer) clearTimeout(greenLightTimer);
}

// Sistema de dados offline
function sendPlayerRegistration() {
    const data = {
        type: 'registration',
        player: currentPlayer,
        timestamp: new Date().toISOString()
    };
    
    sendDataToServer(data);
}

function sendGameData(time, isNegative) {
    const data = {
        type: 'game_result',
        player: currentPlayer.nick,
        name: currentPlayer.name,
        instagram: currentPlayer.instagram,
        time: time,
        isNegative: isNegative,
        totalGames: currentPlayer.totalGames,
        personalBest: currentPlayer.personalBest,
        points: currentPlayer.points,
        timestamp: new Date().toISOString()
    };
    
    sendDataToServer(data);
}

function sendDataToServer(data) {
    saveDataOffline(data);
    
    if (navigator.onLine) {
        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                markDataAsSent(data.timestamp);
            }
        })
        .catch(error => {
            console.log('Erro ao enviar dados:', error);
        });
    }
}

function saveDataOffline(data) {
    let offlineData = JSON.parse(localStorage.getItem('frankturbo_offline_data') || '[]');
    data.status = 'pending';
    offlineData.push(data);
    localStorage.setItem('frankturbo_offline_data', JSON.stringify(offlineData));
}

function markDataAsSent(timestamp) {
    let offlineData = JSON.parse(localStorage.getItem('frankturbo_offline_data') || '[]');
    offlineData = offlineData.map(item => {
        if (item.timestamp === timestamp) {
            item.status = 'sent';
        }
        return item;
    });
    localStorage.setItem('frankturbo_offline_data', JSON.stringify(offlineData));
}

function syncOfflineData() {
    if (!navigator.onLine) return;
    
    let offlineData = JSON.parse(localStorage.getItem('frankturbo_offline_data') || '[]');
    const pendingData = offlineData.filter(item => item.status === 'pending');
    
    if (pendingData.length === 0) return;
    
    pendingData.forEach(data => {
        sendDataToServer(data);
    });
    
    updateSyncStatus(pendingData.length);
}

function updateSyncStatus(pendingCount) {
    if (pendingCount > 0) {
        syncInfo.textContent = `Sincronizando ${pendingCount} registros...`;
    } else {
        syncInfo.textContent = '';
    }
}

function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    const offlineData = JSON.parse(localStorage.getItem('frankturbo_offline_data') || '[]');
    const pendingCount = offlineData.filter(item => item.status === 'pending').length;
    
    if (isOnline) {
        statusText.textContent = '✅ Conectado';
        connectionStatus.className = 'connection-status online';
        if (pendingCount > 0) {
            syncInfo.textContent = `${pendingCount} registros pendentes`;
        } else {
            syncInfo.textContent = 'Sincronizado';
        }
    } else {
        statusText.textContent = '📶 Offline';
        connectionStatus.className = 'connection-status offline';
        syncInfo.textContent = 'Dados salvos localmente';
    }
}

function handleOnline() {
    updateConnectionStatus();
    syncOfflineData();
}

function handleOffline() {
    updateConnectionStatus();
}

function loadGlobalRanking() {
    globalRankingList.innerHTML = '<li>Carregando...</li>';
    
    setTimeout(() => {
        globalRankingList.innerHTML = `
            <li>@frank_turbo - 0.142s</li>
            <li>@speed_demon - 0.156s</li>
            <li>@piloto_pro - 0.167s</li>
            <li>@turbo_master - 0.178s</li>
            <li>@garagem_fan - 0.189s</li>
        `;
        totalPlayersSpan.textContent = '1,247';
    }, 1000);
}

function initializeDailyChallenge() {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem('frankturbo_daily_challenge');
    
    if (!savedChallenge || JSON.parse(savedChallenge).date !== today) {
        const challenge = {
            date: today,
            target: 0.300,
            completed: false,
            progress: 0
        };
        localStorage.setItem('frankturbo_daily_challenge', JSON.stringify(challenge));
    }
    
    updateDailyChallengeDisplay();
}

function updateDailyChallenge(time, isNegative) {
    if (isNegative) return;
    
    const challenge = JSON.parse(localStorage.getItem('frankturbo_daily_challenge'));
    const timeFloat = parseFloat(time);
    
    if (timeFloat < challenge.target && !challenge.completed) {
        challenge.completed = true;
        challenge.progress = 1;
        currentPlayer.points += 100;
        savePlayerData();
        updatePlayerDisplay();
        
        showAchievementNotification({
            icon: '🎯',
            name: 'Desafio Diário Completo!',
            points: 100
        });
    }
    
    localStorage.setItem('frankturbo_daily_challenge', JSON.stringify(challenge));
    updateDailyChallengeDisplay();
}

function updateDailyChallengeDisplay() {
    const challenge = JSON.parse(localStorage.getItem('frankturbo_daily_challenge'));
    
    challengeText.textContent = `Faça um tempo abaixo de ${challenge.target.toFixed(3)}s`;
    challengeProgressText.textContent = challenge.completed ? '1/1 concluído' : '0/1 concluído';
    challengeProgressBar.style.width = (challenge.progress * 100) + '%';
    
    if (challenge.completed) {
        challengeProgressBar.style.backgroundColor = 'var(--success-color)';
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// CSS para validação de nick
const nickValidationCSS = `
.nick-status {
    margin-top: 5px;
    font-size: 0.9rem;
}

.nick-available {
    color: var(--success-color);
}

.nick-error, .nick-taken {
    color: var(--red-on);
}

.nick-checking {
    color: var(--warning-color);
}

.btn-loader {
    display: none;
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 8px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.player-identity {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.player-nick {
    font-size: 0.9rem;
    color: #888;
    font-family: 'Rajdhani', sans-serif;
}

.google-signin-section {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #444;
}

.or-divider {
    margin: 15px 0;
    position: relative;
    text-align: center;
}

.or-divider span {
    background-color: var(--panel-bg);
    padding: 0 15px;
    color: #888;
    font-size: 0.9rem;
}

.or-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #444;
    z-index: -1;
}

.achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: var(--panel-bg);
    border: 2px solid var(--accent-color);
    border-radius: 10px;
    padding: 15px;
    z-index: 1001;
    animation: slideIn 0.5s ease;
    box-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.achievement-icon {
    font-size: 2rem;
}

.achievement-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.achievement-title {
    font-weight: 600;
    color: var(--accent-color);
}

.achievement-name {
    font-size: 1.1rem;
    color: var(--text-color);
}

.achievement-points {
    font-size: 0.9rem;
    color: var(--success-color);
}

.error-blink {
    animation: errorBlink 0.5s ease-in-out 4;
    border-color: #ff4444 !important;
}

@keyframes errorBlink {
    0%, 100% { 
        border-color: #ff4444;
        box-shadow: 0 0 5px rgba(255, 68, 68, 0.5);
    }
    50% { 
        border-color: #ff8888;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
    }
}

/* Animações de pontuação e recorde */
.score-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, var(--panel-bg), rgba(255, 204, 0, 0.1));
    border: 2px solid var(--accent-color);
    border-radius: 15px;
    padding: 20px;
    z-index: 1000;
    animation: scorePopIn 0.5s ease-out;
    box-shadow: 0 0 30px rgba(255, 204, 0, 0.3);
}

.score-content {
    text-align: center;
}

.score-main {
    font-size: 3rem;
    font-weight: bold;
    color: var(--accent-color);
    text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
    margin-bottom: 10px;
}

.score-breakdown {
    font-size: 1rem;
    color: var(--text-color);
    margin-bottom: 10px;
}

.bonus-reason {
    font-size: 0.9rem;
    color: var(--success-color);
    margin: 5px 0;
    animation: bonusBounce 0.6s ease-out;
}

@keyframes scorePopIn {
    0% { 
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
    }
    100% { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
}

@keyframes bonusBounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
}

/* Animação épica de recorde pessoal */
.record-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, 
        rgba(255, 204, 0, 0.9), 
        rgba(255, 165, 0, 0.9), 
        rgba(255, 204, 0, 0.9));
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: recordOverlayIn 1s ease-out;
}

.record-animation {
    position: relative;
    text-align: center;
    animation: recordPulse 2s ease-in-out infinite;
}

.record-content {
    position: relative;
    z-index: 10;
}

.record-title {
    font-size: 4rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;
    animation: recordTitleGlow 2s ease-in-out infinite;
}

.record-time {
    font-size: 6rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
    margin: 20px 0;
    animation: recordTimeScale 1.5s ease-out;
}

.record-ranking {
    margin: 30px 0;
}

.ranking-label {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 10px;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.ranking-position {
    font-size: 4rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
    animation: rankingBounce 1s ease-out 0.5s both;
}

.record-subtitle {
    font-size: 1.8rem;
    color: #fff;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    margin-top: 20px;
    animation: subtitleFadeIn 1s ease-out 1s both;
}

.record-fireworks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.firework {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    animation: fireworkExplode 2s ease-out infinite;
}

.record-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    animation: particleFall 3s linear infinite;
}

@keyframes recordOverlayIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes recordPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes recordTitleGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(0, 0, 0, 0.5); }
    50% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8); }
}

@keyframes recordTimeScale {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes rankingBounce {
    0% { transform: translateY(50px); opacity: 0; }
    60% { transform: translateY(-10px); opacity: 1; }
    100% { transform: translateY(0); }
}

@keyframes subtitleFadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes fireworkExplode {
    0% { 
        transform: scale(0) rotate(0deg);
        opacity: 1;
    }
    50% { 
        transform: scale(1) rotate(180deg);
        opacity: 1;
    }
    100% { 
        transform: scale(0) rotate(360deg);
        opacity: 0;
    }
}

@keyframes particleFall {
    0% { 
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
    }
    100% { 
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}

.fade-out {
    animation: fadeOut 1s ease-out forwards;
}

@keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
}

/* Animação de pontuação em tempo real */
.points-animation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pointsOverlayIn 0.3s ease-out;
}

.points-animation {
    text-align: center;
    animation: pointsAnimationScale 0.5s ease-out;
}

.points-change {
    font-size: 6rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-shadow: 0 0 20px currentColor;
    animation: pointsChangePulse 0.8s ease-out;
}

.points-change.positive {
    color: var(--success-color);
}

.points-change.negative {
    color: var(--red-on);
}

.points-counter, .daily-points-counter {
    margin: 15px 0;
}

.points-label, .daily-label {
    font-size: 1.5rem;
    color: var(--text-color);
    display: block;
    margin-bottom: 5px;
}

.points-value, .daily-value {
    font-size: 3rem;
    font-weight: bold;
    color: var(--accent-color);
    text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
}

.daily-value {
    font-size: 2rem;
    color: var(--success-color);
}

@keyframes pointsOverlayIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

@keyframes pointsAnimationScale {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes pointsChangePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Popup de prêmios diários */
.prizes-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, 
        rgba(255, 204, 0, 0.9), 
        rgba(255, 165, 0, 0.9), 
        rgba(255, 204, 0, 0.9));
    z-index: 3500;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: prizesOverlayIn 0.8s ease-out;
}

.prizes-content {
    background: var(--panel-bg);
    border: 3px solid var(--accent-color);
    border-radius: 20px;
    padding: 40px;
    max-width: 90%;
    max-height: 90%;
    text-align: center;
    box-shadow: 0 0 50px rgba(255, 204, 0, 0.5);
    animation: prizesContentBounce 0.8s ease-out;
}

.prizes-header h2 {
    color: var(--accent-color);
    font-size: 3rem;
    margin: 0 0 10px 0;
    text-shadow: 0 0 15px rgba(255, 204, 0, 0.5);
}

.prizes-header p {
    color: var(--text-color);
    font-size: 1.3rem;
    margin: 0 0 30px 0;
}

.prizes-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 30px 0;
}

.prize-item {
    background: linear-gradient(135deg, rgba(255, 204, 0, 0.1), rgba(255, 165, 0, 0.1));
    border: 2px solid var(--accent-color);
    border-radius: 15px;
    padding: 20px;
    animation: prizeItemSlide 0.6s ease-out;
}

.prize-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-color);
    margin-bottom: 10px;
}

.prize-description {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 10px;
}

.prize-reward {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--success-color);
}

.prizes-close {
    background: var(--accent-color);
    color: var(--bg-color);
    border: none;
    border-radius: 10px;
    padding: 15px 30px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.prizes-close:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 204, 0, 0.3);
}

@keyframes prizesOverlayIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes prizesContentBounce {
    0% { transform: translateY(-50px); opacity: 0; }
    60% { transform: translateY(10px); opacity: 1; }
    100% { transform: translateY(0); }
}

@keyframes prizeItemSlide {
    0% { transform: translateX(-100px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
}

@media (max-width: 768px) {
    .prizes-content {
        padding: 20px;
        margin: 20px;
    }
    
    .prizes-header h2 {
        font-size: 2rem;
    }
    
    .prize-title {
        font-size: 1.5rem;
    }
    
    .points-change {
        font-size: 4rem;
    }
    
    .points-value {
        font-size: 2rem;
    }
}

/* Popup de compartilhamento */
.share-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: sharePopupIn 0.5s ease-out;
}

.share-content {
    background: var(--panel-bg);
    border: 2px solid var(--accent-color);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90%;
    text-align: center;
    box-shadow: 0 0 50px rgba(255, 204, 0, 0.3);
}

.share-header h2 {
    color: var(--accent-color);
    margin: 0 0 10px 0;
    font-size: 2.5rem;
}

.share-header p {
    color: var(--text-color);
    margin: 0 0 20px 0;
    font-size: 1.2rem;
}

.share-preview {
    margin: 20px 0;
}

.share-preview canvas {
    max-width: 300px;
    max-height: 300px;
    border: 2px solid var(--accent-color);
    border-radius: 10px;
}

.share-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 20px;
}

.share-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
}

.share-btn.download {
    background: var(--success-color);
    color: white;
}

.share-btn.share {
    background: linear-gradient(45deg, #E1306C, #F56040, #FCAF45);
    color: white;
}

.share-btn.close {
    background: var(--red-on);
    color: white;
}

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

@keyframes sharePopupIn {
    0% { 
        opacity: 0; 
        transform: scale(0.8);
    }
    100% { 
        opacity: 1; 
        transform: scale(1);
    }
}

@media (max-width: 768px) {
    .share-content {
        padding: 20px;
        margin: 20px;
    }
    
    .share-header h2 {
        font-size: 2rem;
    }
    
    .share-preview canvas {
        max-width: 250px;
        max-height: 250px;
    }
    
    .share-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .share-btn {
        width: 100%;
        max-width: 250px;
    }
}
`;

const style = document.createElement('style');
style.textContent = nickValidationCSS;
document.head.appendChild(style);




// Simple Profile Card Functions
function togglePlayerStats() {
    const profileDetails = document.getElementById('player-profile-details');
    
    if (profileDetails.classList.contains('hidden')) {
        updateProfileDetails();
        profileDetails.classList.remove('hidden');
    } else {
        profileDetails.classList.add('hidden');
    }
}

function updateProfileDetails() {
    if (!currentPlayer) return;
    
    // Update basic stats
    document.getElementById('profile-games').textContent = currentPlayer.totalGames;
    document.getElementById('profile-best').textContent = currentPlayer.bestTime ? `${currentPlayer.bestTime}s` : '--';
    document.getElementById('profile-points-total').textContent = currentPlayer.points;
    document.getElementById('profile-position-global').textContent = currentPlayer.globalPosition || '#--';
    
    // Calculate accuracy
    const validGames = currentPlayer.totalGames - (currentPlayer.burnouts || 0);
    const accuracy = currentPlayer.totalGames > 0 ? Math.round((validGames / currentPlayer.totalGames) * 100) : 0;
    document.getElementById('profile-accuracy-rate').textContent = `${accuracy}%`;
    
    // Achievements count
    const achievementsCount = currentPlayer.achievements ? currentPlayer.achievements.length : 0;
    document.getElementById('profile-achievements-count').textContent = `${achievementsCount}/50`;
    
    // Update recent achievements
    updateRecentAchievementsSimple();
}

function updateRecentAchievementsSimple() {
    const recentList = document.getElementById('profile-recent-list');
    
    if (!currentPlayer.achievements || currentPlayer.achievements.length === 0) {
        recentList.innerHTML = '<span class="no-recent">Jogue para desbloquear conquistas!</span>';
        return;
    }
    
    // Get last 4 achievements
    const recentAchievements = currentPlayer.achievements.slice(-4).reverse();
    
    recentList.innerHTML = '';
    
    recentAchievements.forEach(achievementId => {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'recent-achievement-simple';
            achievementEl.innerHTML = `
                <span>${achievement.icon}</span>
                <span>${achievement.name}</span>
            `;
            achievementEl.title = achievement.description;
            recentList.appendChild(achievementEl);
        }
    });
}

