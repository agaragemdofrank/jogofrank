// Ranking System JavaScript - VERSÃO LIMPA
class RankingSystem {
    constructor() {
        this.rankings = [];
        this.storageKey = 'frankturbo_global_ranking';
        this.maxRankings = 10;
        this.init();
    }

    init() {
        this.loadRankings();
        this.setupRankingDisplay();
        this.startAutoUpdate();
    }

    // Load rankings from Google Sheets or localStorage
    async loadRankings() {
        try {
            // Tentar carregar do Google Sheets primeiro
            if (window.sheetsIntegration) {
                const response = await window.sheetsIntegration.getRanking();
                
                if (response.success && response.data) {
                    this.rankings = response.data.slice(0, this.maxRankings);
                    this.saveRankings(); // Cache local
                    return;
                }
            }
        } catch (error) {
            console.log('Carregando ranking local (Google Sheets indisponível)');
        }
        
        // Fallback para localStorage
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.rankings = JSON.parse(stored);
        } else {
            // Inicializar vazio - SEM DADOS FAKE
            this.rankings = [];
            this.saveRankings();
        }
    }

    // Save rankings to localStorage
    saveRankings() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.rankings));
    }

    // Add new time to ranking
    async addTime(nick, time, location = "Brasil") {
        const newEntry = {
            nick: nick,
            time: time,
            date: new Date().toISOString().split('T')[0],
            location: location
        };

        // Add to rankings
        this.rankings.push(newEntry);
        
        // Sort by time (ascending - best times first)
        this.rankings.sort((a, b) => a.time - b.time);
        
        // Keep only top 10
        this.rankings = this.rankings.slice(0, this.maxRankings);
        
        // Save to localStorage
        this.saveRankings();
        
        // Save to Google Sheets
        try {
            if (window.sheetsIntegration) {
                await window.sheetsIntegration.saveRanking(nick, time, location);
            }
        } catch (error) {
            console.error('Erro ao salvar no Google Sheets:', error);
        }
        
        // Update display
        this.updateRankingDisplay();
        
        // Check if it's a new record
        if (this.rankings.length > 0 && this.rankings[0].nick === nick && this.rankings[0].time === time) {
            this.showNewRecordNotification(nick, time);
        }
    }

    // Setup ranking display
    setupRankingDisplay() {
        this.updateRankingDisplay();
    }

    // Update ranking display
    updateRankingDisplay() {
        const rankingContainer = document.getElementById('ranking-list');
        if (!rankingContainer) return;

        if (this.rankings.length === 0) {
            rankingContainer.innerHTML = `
                <div class="no-rankings">
                    <div class="no-rankings-icon">🏆</div>
                    <div class="no-rankings-text">
                        <h3>Seja o primeiro!</h3>
                        <p>Nenhum tempo registrado ainda.<br>Jogue o simulador e entre para a história!</p>
                    </div>
                </div>
            `;
            return;
        }

        let html = '';
        this.rankings.slice(0, 5).forEach((entry, index) => {
            const position = index + 1;
            const medal = this.getMedalIcon(position);
            const timeFormatted = entry.time.toFixed(3);
            
            html += `
                <div class="ranking-item ${position <= 3 ? 'podium' : ''}">
                    <div class="ranking-position">
                        <span class="position-number">${position}</span>
                        <span class="medal">${medal}</span>
                    </div>
                    <div class="ranking-info">
                        <div class="player-nick">${entry.nick}</div>
                        <div class="player-time">${timeFormatted}s</div>
                    </div>
                    <div class="ranking-location">${entry.location}</div>
                </div>
            `;
        });

        rankingContainer.innerHTML = html;
    }

    getMedalIcon(position) {
        switch(position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏁';
        }
    }

    showNewRecordNotification(nick, time) {
        // Show notification for new record
        const notification = document.createElement('div');
        notification.className = 'record-notification';
        notification.innerHTML = `
            <div class="record-content">
                <div class="record-icon">🏆</div>
                <div class="record-text">
                    <strong>NOVO RECORDE MUNDIAL!</strong><br>
                    ${nick} - ${time.toFixed(3)}s
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Start auto update
    startAutoUpdate() {
        // Update ranking every 30 seconds
        setInterval(() => {
            this.loadRankings();
        }, 30000);
    }

    // Get current rankings
    getCurrentRankings() {
        return this.rankings;
    }

    // Check if time qualifies for ranking
    qualifiesForRanking(time) {
        if (this.rankings.length < this.maxRankings) {
            return true;
        }
        
        const worstTime = this.rankings[this.rankings.length - 1].time;
        return time < worstTime;
    }
}

// Initialize ranking system when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined') {
        window.rankingSystem = new RankingSystem();
    }
});

