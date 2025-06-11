// Ranking System JavaScript
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
            // Initialize with some demo data
            this.rankings = [
                { nick: "SpeedDemon", time: 0.045, date: "2024-12-15", location: "São Paulo, SP" },
                { nick: "TurboFrank", time: 0.052, date: "2024-12-14", location: "Rio de Janeiro, RJ" },
                { nick: "RacingKing", time: 0.058, date: "2024-12-13", location: "Belo Horizonte, MG" },
                { nick: "FastCar99", time: 0.061, date: "2024-12-12", location: "Porto Alegre, RS" },
                { nick: "NitroBoost", time: 0.067, date: "2024-12-11", location: "Curitiba, PR" },
                { nick: "ThunderBolt", time: 0.072, date: "2024-12-10", location: "Salvador, BA" },
                { nick: "VelocityMax", time: 0.078, date: "2024-12-09", location: "Fortaleza, CE" },
                { nick: "TurboCharged", time: 0.084, date: "2024-12-08", location: "Brasília, DF" },
                { nick: "SpeedMaster", time: 0.091, date: "2024-12-07", location: "Recife, PE" },
                { nick: "RocketMan", time: 0.098, date: "2024-12-06", location: "Manaus, AM" }
            ];
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
        const position = this.rankings.findIndex(entry => 
            entry.nick === nick && entry.time === time && entry.date === newEntry.date
        ) + 1;
        
        if (position <= this.maxRankings) {
            this.showRankingNotification(nick, time, position);
        }
        
        return position;
    }

    // Setup ranking display on page load
    setupRankingDisplay() {
        if (document.getElementById('ranking-list')) {
            this.updateRankingDisplay();
        }
    }

    // Update ranking display
    updateRankingDisplay() {
        const rankingList = document.getElementById('ranking-list');
        if (!rankingList) return;

        // Show only top 5 for simplified display
        const topRankings = this.rankings.slice(0, 5);

        rankingList.innerHTML = topRankings.map((entry, index) => `
            <div class="ranking-item-simple">
                <span class="rank-pos">${index + 1}º</span>
                <span class="rank-nick">${entry.nick}</span>
                <span class="rank-time">${entry.time.toFixed(3)}s</span>
            </div>
        `).join('');

        // Update ranking stats if elements exist
        this.updateRankingStats();
    }

    // Update ranking statistics
    updateRankingStats() {
        const statsElements = {
            'best-time': this.rankings.length > 0 ? `${this.rankings[0].time.toFixed(3)}s` : '---',
            'total-players': this.getTotalPlayers(),
            'avg-time': this.getAverageTime(),
            'last-update': this.getLastUpdate()
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // Get total unique players
    getTotalPlayers() {
        const uniquePlayers = new Set(this.rankings.map(entry => entry.nick));
        return uniquePlayers.size;
    }

    // Get average time
    getAverageTime() {
        if (this.rankings.length === 0) return '---';
        const avg = this.rankings.reduce((sum, entry) => sum + entry.time, 0) / this.rankings.length;
        return `${avg.toFixed(3)}s`;
    }

    // Get last update time
    getLastUpdate() {
        if (this.rankings.length === 0) return '---';
        const latest = this.rankings.reduce((latest, entry) => 
            new Date(entry.date) > new Date(latest.date) ? entry : latest
        );
        return this.formatDate(latest.date);
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hoje';
        if (diffDays === 2) return 'Ontem';
        if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }

    // Show ranking notification
    showRankingNotification(nick, time, position) {
        const notification = document.createElement('div');
        notification.className = 'ranking-notification';
        
        let message = '';
        let icon = '';
        
        if (position === 1) {
            message = `🏆 NOVO RECORDE MUNDIAL! ${nick} com ${time.toFixed(3)}s!`;
            icon = '👑';
        } else if (position <= 3) {
            message = `🏅 ${nick} entrou no TOP 3 com ${time.toFixed(3)}s!`;
            icon = '🥇';
        } else if (position <= 10) {
            message = `⭐ ${nick} entrou no TOP 10 com ${time.toFixed(3)}s!`;
            icon = '🏆';
        }

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Start auto update (check for new data every 30 seconds)
    startAutoUpdate() {
        setInterval(() => {
            this.checkForUpdates();
        }, 30000);
    }

    // Check for updates from game
    checkForUpdates() {
        // This would normally check a server for new rankings
        // For now, we'll just refresh the display
        this.updateRankingDisplay();
    }

    // Get player ranking position
    getPlayerRanking(nick) {
        const position = this.rankings.findIndex(entry => entry.nick === nick) + 1;
        return position > 0 ? position : null;
    }

    // Get player best time
    getPlayerBestTime(nick) {
        const playerEntries = this.rankings.filter(entry => entry.nick === nick);
        if (playerEntries.length === 0) return null;
        
        return Math.min(...playerEntries.map(entry => entry.time));
    }

    // Export rankings data
    exportRankings() {
        return {
            rankings: this.rankings,
            exportDate: new Date().toISOString(),
            totalPlayers: this.getTotalPlayers()
        };
    }

    // Import rankings data
    importRankings(data) {
        if (data && data.rankings && Array.isArray(data.rankings)) {
            this.rankings = data.rankings;
            this.saveRankings();
            this.updateRankingDisplay();
            return true;
        }
        return false;
    }

    // Clear all rankings (admin function)
    clearRankings() {
        this.rankings = [];
        this.saveRankings();
        this.updateRankingDisplay();
    }
}

// Initialize ranking system when page loads
let globalRanking;

document.addEventListener('DOMContentLoaded', function() {
    globalRanking = new RankingSystem();
});

// Function to be called from the game
function submitTimeToRanking(nick, time, location = "Brasil") {
    if (globalRanking) {
        return globalRanking.addTime(nick, time, location);
    }
    return null;
}

// Function to get current rankings
function getCurrentRankings() {
    return globalRanking ? globalRanking.rankings : [];
}

// Function to get player stats
function getPlayerStats(nick) {
    if (!globalRanking) return null;
    
    return {
        position: globalRanking.getPlayerRanking(nick),
        bestTime: globalRanking.getPlayerBestTime(nick),
        totalEntries: globalRanking.rankings.filter(entry => entry.nick === nick).length
    };
}

