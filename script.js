// Elementos do DOM
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
const bestTimesList = document.getElementById('best-times-list');
const lastTimesList = document.getElementById('last-times-list');
const worstTimesList = document.getElementById('worst-times-list');
const playerModal = document.getElementById('player-modal');
const playerNameInput = document.getElementById('player-name');
const startGameBtn = document.getElementById('start-game-btn');
const soundToggle = document.getElementById('sound-toggle');

// Variáveis de estado do jogo
let gameState = 'idle'; // idle, staging, countdown, ready, finished
let startTime = 0;
let reactionTime = 0;
let bestTimes = [];
let lastTimes = [];
let worstTimes = [];
let countdownTimers = [];
let greenLightTimer = null;
let falseStartTime = 0; // Tempo em que ocorreu a queima de largada
let playerName = ''; // Nome do jogador
let soundEnabled = true; // Som ativado por padrão

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o jogador já tem nome salvo
    const savedPlayerName = localStorage.getItem('garagemFrankPlayerName');

    if (savedPlayerName) {
        playerName = savedPlayerName;
        // Não precisa chamar hidePlayerModal() aqui, pois o modal já começa oculto no CSS
    } else {
        // Mostrar o modal apenas se não tiver nome salvo
        playerModal.style.display = 'flex';
    }

    // Carregar tempos salvos do localStorage (se existirem)
    loadTimes(); // Carrega os tempos
    updateTimesDisplay(); // Atualiza a exibição (aqui ocorria o erro se dados inválidos)

    // Adicionar event listeners
    startButton.addEventListener('click', handleStartButtonClick);
    document.addEventListener('keydown', handleKeyPress);
    startGameBtn.addEventListener('click', handlePlayerNameSubmit);
    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePlayerNameSubmit();
    });
    soundToggle.addEventListener('change', toggleSound);
});

// Funções de identificação do jogador
function showPlayerModal() {
    playerModal.style.display = 'flex';
}

function hidePlayerModal() {
    playerModal.style.display = 'none';
}

function handlePlayerNameSubmit() {
    const name = playerNameInput.value.trim();
    if (name) {
        playerName = name;
        localStorage.setItem('garagemFrankPlayerName', playerName);
        hidePlayerModal();
        console.log("Modal fechado, nome salvo:", playerName);
    } else {
        alert('Por favor, digite seu nome para continuar.');
    }
}

// Funções de áudio
function playSound(type) {
    if (!soundEnabled) return;

    const audioElement = document.createElement('audio');
    let soundFile;

    switch(type) {
        case 'click':
            soundFile = 'sounds/click.mp3';
            break;
        case 'good':
            const goodIndex = Math.floor(Math.random() * 10) + 1;
            soundFile = `sounds/bom/bom_${goodIndex.toString().padStart(2, '0')}.mp3`;
            break;
        case 'bad':
            const badIndex = Math.floor(Math.random() * 10) + 1;
            soundFile = `sounds/ruim/ruim_${badIndex.toString().padStart(2, '0')}.mp3`;
            break;
    }

    audioElement.src = soundFile;
    audioElement.volume = 1.0;
    document.body.appendChild(audioElement);

    audioElement.play()
        .then(() => {
            console.log(`Som ${type} reproduzido com sucesso`);
            audioElement.onended = () => {
                if (audioElement.parentNode === document.body) { // Verifica se ainda é filho
                    document.body.removeChild(audioElement);
                }
            };
        })
        .catch(error => {
            console.error('Erro ao reproduzir áudio:', error);
             if (audioElement.parentNode === document.body) { // Verifica antes de remover
                document.body.removeChild(audioElement);
            }
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                if (type === 'click') oscillator.frequency.value = 800;
                else if (type === 'good') oscillator.frequency.value = 1200;
                else if (type === 'bad') oscillator.frequency.value = 400;
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                setTimeout(() => oscillator.stop(), 200);
                console.log('Usando fallback de áudio');
            } catch (e) {
                console.error('Fallback de áudio falhou:', e);
            }
        });
}

function toggleSound() {
    soundEnabled = soundToggle.checked;
    localStorage.setItem('garagemFrankSoundEnabled', soundEnabled);
}

// Funções principais
function handleStartButtonClick() {
    playSound('click');

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
        statusMessage.textContent = 'Pronto...';
    }, 1000);

    setTimeout(() => {
        gameState = 'countdown';
        startAmberSequence();
    }, 2000);
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

    // Estimativa do tempo da luz verde. Não é perfeito, mas dá uma ideia da antecipação.
    // Poderia ser mais preciso se soubéssemos o randomDelay exato que *seria* usado.
    // A lógica original usava Date.now() + 650. Se a última amarela acendeu, e o randomDelay é entre 300-1000ms.
    // Para simplificar, podemos usar o tempo atual como base para o quão cedo foi.
    // O importante é registrar um tempo negativo.
    // Se startTime não foi definido (porque a luz verde não acendeu), precisamos de uma referência.
    // A última luz amarela acende em 400 * 3 = 1200ms após o início da sequência âmbar.
    // A luz verde acenderia entre 1200+300=1500ms e 1200+1000=2200ms após o início da sequência âmbar.
    // falseStartTime é Date.now().
    // Para ter um valor negativo consistente, podemos calcular a diferença para um ponto de referência, como o momento em que a última luz amarela acendeu.
    // No entanto, a lógica original `(falseStartTime - estimatedGreenTime) / 1000` tentava estimar.
    // Para simplificar e apenas garantir um valor negativo, podemos exibir algo como -0.XXX baseado em alguma heurística.
    // A lógica anterior: const estimatedGreenTime = Date.now() + 650; // Isso parece errado, pois Date.now() aqui é o falseStartTime.
    // Seria algo como: tempo da última amarela + delay médio.
    // Por ora, vamos manter a lógica original de exibição, mas a gravação do tempo deve ser a string.
    // Se a referência para `startTime` não existe, o cálculo do tempo "queimado" pode ser apenas simbólico.
    // O importante é que `isNegative` seja true.
    
    // Um tempo negativo simbólico, ou pode ser calculado com mais precisão se necessário.
    // A forma mais simples de ter um tempo negativo é se basear no `startTime` que *não* foi setado.
    // Vamos assumir que se a luz verde não acendeu, `startTime` ainda é 0 ou o valor anterior.
    // Para o propósito do jogo, um valor fixo negativo ou um cálculo mais simples pode ser usado.
    // A lógica de `recordTime` agora espera uma string formatada.
    const falseStartDisplayTime = "-0." + (Math.floor(Math.random() * 150) + 50).toString().padStart(3, '0'); // Ex: -0.050 a -0.200
    
    timeDisplay.textContent = falseStartDisplayTime;
    timeDisplay.classList.add('negative');
    statusMessage.textContent = 'Largada queimada!';
    startButton.textContent = 'TENTAR NOVAMENTE';
    playSound('bad');
    document.removeEventListener('click', checkFalseStart);
    document.removeEventListener('keydown', checkFalseStartKey);
    recordTime(falseStartDisplayTime, true); // Passa a string formatada
}

function recordReaction() {
    if (gameState !== 'ready') return;

    gameState = 'finished';
    const endTime = Date.now();
    reactionTime = (endTime - startTime) / 1000;
    const formattedTime = reactionTime.toFixed(3); // formattedTime é uma string

    timeDisplay.textContent = formattedTime;
    playSound('good');

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
    recordTime(formattedTime, false); // Passa a string formatada
    document.removeEventListener('click', checkFalseStart);
    document.removeEventListener('keydown', checkFalseStartKey);
}

function recordTime(time, isNegative) { // 'time' aqui é uma string formatada
    // Adicionar aos últimos tempos
    const timeObjForLast = {
        time: time, // Usa a string formatada diretamente
        isNegative: isNegative,
        playerName: playerName
    };
    lastTimes.unshift(timeObjForLast);
    if (lastTimes.length > 10) {
        lastTimes.pop();
    }

    const timeValue = parseFloat(time); // Converte a string para número para best/worst

    if (isNaN(timeValue)) {
        console.error("Tempo inválido (NaN) detectado, não será adicionado aos melhores/piores:", time);
    } else {
        if (!isNegative) { // Melhores tempos (não queimadas)
            bestTimes.push({
                time: timeValue, // Salva como número
                playerName: playerName
            });
            bestTimes.sort((a, b) => a.time - b.time);
            if (bestTimes.length > 5) {
                bestTimes.pop();
            }
        } else { // Piores tempos (queimadas)
            worstTimes.push({
                time: timeValue, // Salva como número (será negativo)
                playerName: playerName
            });
            worstTimes.sort((a, b) => a.time - b.time); // Ordena do menor (mais negativo) para o maior
            if (worstTimes.length > 5) {
                worstTimes.pop(); // Remove o menos pior (maior valor) para manter os 5 piores
            }
        }
    }
    
    saveTimes();
    updateTimesDisplay();
}

function updateTimesDisplay() {
    // Atualizar lista de melhores tempos
    bestTimesList.innerHTML = '';
    if (bestTimes.length === 0) {
        bestTimesList.innerHTML = '<li>Ainda sem registros</li>';
    } else {
        bestTimes.forEach(timeObj => {
            const li = document.createElement('li');
            // ADICIONADA VERIFICAÇÃO
            if (timeObj && typeof timeObj.time === 'number' && !isNaN(timeObj.time)) {
                li.innerHTML = `<span class="player-name">${timeObj.playerName || 'Jogador'}</span>: ${timeObj.time.toFixed(3)}s`;
            } else {
                li.innerHTML = `<span class="player-name">${(timeObj && timeObj.playerName) ? timeObj.playerName : 'Jogador'}</span>: Tempo inválido`;
                console.warn('Objeto de tempo inválido nos melhores tempos:', timeObj);
            }
            bestTimesList.appendChild(li);
        });
    }

    // Atualizar lista de piores tempos (queimadas)
    worstTimesList.innerHTML = '';
    if (worstTimes.length === 0) {
        worstTimesList.innerHTML = '<li>Ainda sem registros</li>';
    } else {
        worstTimes.forEach(timeObj => {
            const li = document.createElement('li');
            // ADICIONADA VERIFICAÇÃO
            if (timeObj && typeof timeObj.time === 'number' && !isNaN(timeObj.time)) {
                li.innerHTML = `<span class="player-name">${timeObj.playerName || 'Jogador'}</span>: <span class="negative-time">${timeObj.time.toFixed(3)}s</span>`;
            } else {
                li.innerHTML = `<span class="player-name">${(timeObj && timeObj.playerName) ? timeObj.playerName : 'Jogador'}</span>: <span class="negative-time">Tempo inválido</span>`;
                console.warn('Objeto de tempo inválido nos piores tempos:', timeObj);
            }
            worstTimesList.appendChild(li);
        });
    }

    // Atualizar lista de últimos tempos
    lastTimesList.innerHTML = '';
    if (lastTimes.length === 0) {
        lastTimesList.innerHTML = '<li>Ainda sem registros</li>';
    } else {
        lastTimes.forEach(timeObj => {
            const li = document.createElement('li');
            // lastTimes armazena 'time' como string já formatada
            if (timeObj.isNegative) {
                li.innerHTML = `<span class="player-name">${timeObj.playerName || 'Jogador'}</span>: <span class="negative-time">${timeObj.time}s</span> (Queimada)`;
            } else {
                li.innerHTML = `<span class="player-name">${timeObj.playerName || 'Jogador'}</span>: ${timeObj.time}s`;
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
    // Não precisa remover event listeners de false start aqui, pois já são removidos em recordReaction e falseLaunch
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
    greenLightTimer = null; // Resetar o timer da luz verde
}

function saveTimes() {
    localStorage.setItem('garagemFrankBestTimes', JSON.stringify(bestTimes));
    localStorage.setItem('garagemFrankLastTimes', JSON.stringify(lastTimes));
    localStorage.setItem('garagemFrankWorstTimes', JSON.stringify(worstTimes));
}

function loadTimes() {
    const savedBestTimes = localStorage.getItem('garagemFrankBestTimes');
    const savedLastTimes = localStorage.getItem('garagemFrankLastTimes');
    const savedWorstTimes = localStorage.getItem('garagemFrankWorstTimes');
    const savedSoundEnabled = localStorage.getItem('garagemFrankSoundEnabled');

    if (savedBestTimes) {
        bestTimes = JSON.parse(savedBestTimes);
    }
    if (savedLastTimes) {
        lastTimes = JSON.parse(savedLastTimes);
    }
    if (savedWorstTimes) {
        worstTimes = JSON.parse(savedWorstTimes);
    }
    if (savedSoundEnabled !== null) {
        soundEnabled = savedSoundEnabled === 'true';
        soundToggle.checked = soundEnabled;
    }
}