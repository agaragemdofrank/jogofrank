/**
 * GARAGEM DO FRANK - INTEGRAÇÃO GOOGLE SHEETS
 * Sistema de comunicação com Google Apps Script
 * Suporte offline/online com sincronização automática
 */

class SheetsIntegration {
    constructor() {
        this.scriptUrl = 'https://script.google.com/macros/s/SEU_SCRIPT_ID_AQUI/exec';
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.storageKey = 'frankturbo_offline_data';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        
        this.init();
    }

    init() {
        this.loadOfflineQueue();
        this.setupEventListeners();
        this.startSyncProcess();
        
        // Tentar sincronizar dados offline na inicialização
        if (this.isOnline) {
            this.processOfflineQueue();
        }
    }

    setupEventListeners() {
        // Monitorar status de conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Conexão restaurada - Sincronizando dados...');
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Modo offline ativado - Dados serão salvos localmente');
        });

        // Sincronizar antes de fechar a página
        window.addEventListener('beforeunload', () => {
            this.saveOfflineQueue();
        });
    }

    startSyncProcess() {
        // Tentar sincronizar a cada 30 segundos
        setInterval(() => {
            if (this.isOnline && this.offlineQueue.length > 0) {
                this.processOfflineQueue();
            }
        }, 30000);
    }

    /**
     * MÉTODO PRINCIPAL - Enviar dados para Google Sheets
     */
    async sendData(action, data, options = {}) {
        const requestData = {
            action: action,
            ...data,
            timestamp: new Date().toISOString(),
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            ip: await this.getClientIP()
        };

        if (this.isOnline) {
            try {
                const response = await this.makeRequest(requestData);
                
                if (response.success) {
                    // Remover da fila offline se estava lá
                    this.removeFromOfflineQueue(requestData);
                    
                    if (options.showNotification !== false) {
                        this.showNotification('✅ Dados salvos com sucesso!', 'success');
                    }
                    
                    return response;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Erro ao enviar dados:', error);
                
                // Adicionar à fila offline
                this.addToOfflineQueue(requestData);
                
                if (options.showNotification !== false) {
                    this.showNotification('📱 Dados salvos offline - Serão sincronizados automaticamente', 'info');
                }
                
                return { success: false, error: error.message, offline: true };
            }
        } else {
            // Modo offline - salvar na fila
            this.addToOfflineQueue(requestData);
            
            if (options.showNotification !== false) {
                this.showNotification('📱 Dados salvos offline - Serão sincronizados quando conectar', 'info');
            }
            
            return { success: true, offline: true };
        }
    }

    /**
     * MÉTODOS ESPECÍFICOS PARA CADA TIPO DE DADO
     */

    // Salvar tempo no ranking
    async saveRanking(nick, time, location = 'Brasil') {
        return await this.sendData('save_ranking', {
            nick: nick,
            time: parseFloat(time),
            location: location,
            device: this.getDeviceType()
        });
    }

    // Cadastrar usuário
    async saveUser(userData) {
        return await this.sendData('save_user', {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            nick: userData.nick,
            location: userData.location,
            source: 'portal'
        });
    }

    // Salvar contato
    async saveContact(contactData) {
        return await this.sendData('save_contact', {
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            subject: contactData.subject,
            message: contactData.message,
            source: 'portal'
        });
    }

    // Salvar pedido da loja
    async saveOrder(orderData) {
        return await this.sendData('save_order', {
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            items: orderData.items,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod
        });
    }

    // Salvar doação
    async saveDonation(donationData) {
        return await this.sendData('save_donation', {
            donorName: donationData.donorName,
            donorEmail: donationData.donorEmail,
            amount: parseFloat(donationData.amount),
            method: donationData.method,
            message: donationData.message,
            isPublic: donationData.isPublic
        });
    }

    // Obter ranking atualizado
    async getRanking() {
        if (!this.isOnline) {
            // Retornar dados em cache se offline
            const cachedRanking = localStorage.getItem('frankturbo_ranking_cache');
            if (cachedRanking) {
                return JSON.parse(cachedRanking);
            }
            return { success: false, offline: true };
        }

        try {
            const response = await this.makeRequest({ action: 'get_ranking' });
            
            if (response.success) {
                // Cachear dados para uso offline
                localStorage.setItem('frankturbo_ranking_cache', JSON.stringify(response));
                return response;
            }
            
            return response;
        } catch (error) {
            console.error('Erro ao obter ranking:', error);
            return { success: false, error: error.message };
        }
    }

    // Obter estatísticas
    async getStats() {
        if (!this.isOnline) {
            return { success: false, offline: true };
        }

        try {
            const response = await this.makeRequest({ action: 'get_stats' });
            return response;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * MÉTODOS DE COMUNICAÇÃO
     */
    async makeRequest(data, retryCount = 0) {
        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(`Tentativa ${retryCount + 1} falhou:`, error);

            if (retryCount < this.maxRetries) {
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.makeRequest(data, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * GERENCIAMENTO DE FILA OFFLINE
     */
    addToOfflineQueue(data) {
        // Evitar duplicatas
        const exists = this.offlineQueue.some(item => 
            item.action === data.action && 
            JSON.stringify(item) === JSON.stringify(data)
        );

        if (!exists) {
            this.offlineQueue.push({
                ...data,
                queuedAt: new Date().toISOString(),
                retries: 0
            });
            this.saveOfflineQueue();
        }
    }

    removeFromOfflineQueue(data) {
        this.offlineQueue = this.offlineQueue.filter(item => 
            !(item.action === data.action && 
              JSON.stringify(item) === JSON.stringify(data))
        );
        this.saveOfflineQueue();
    }

    async processOfflineQueue() {
        if (!this.isOnline || this.offlineQueue.length === 0) {
            return;
        }

        console.log(`🔄 Sincronizando ${this.offlineQueue.length} itens offline...`);

        const itemsToProcess = [...this.offlineQueue];
        let successCount = 0;
        let errorCount = 0;

        for (const item of itemsToProcess) {
            try {
                const response = await this.makeRequest(item);
                
                if (response.success) {
                    this.removeFromOfflineQueue(item);
                    successCount++;
                } else {
                    item.retries = (item.retries || 0) + 1;
                    
                    // Remover itens com muitas tentativas
                    if (item.retries >= this.maxRetries) {
                        this.removeFromOfflineQueue(item);
                        errorCount++;
                    }
                }
            } catch (error) {
                console.error('Erro ao sincronizar item:', error);
                item.retries = (item.retries || 0) + 1;
                
                if (item.retries >= this.maxRetries) {
                    this.removeFromOfflineQueue(item);
                    errorCount++;
                }
            }

            // Pequena pausa entre requisições
            await this.delay(500);
        }

        if (successCount > 0 || errorCount > 0) {
            this.showNotification(
                `✅ ${successCount} itens sincronizados${errorCount > 0 ? `, ${errorCount} falharam` : ''}`,
                errorCount > 0 ? 'warning' : 'success'
            );
        }
    }

    saveOfflineQueue() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.offlineQueue));
        } catch (error) {
            console.error('Erro ao salvar fila offline:', error);
        }
    }

    loadOfflineQueue() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.offlineQueue = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Erro ao carregar fila offline:', error);
            this.offlineQueue = [];
        }
    }

    /**
     * MÉTODOS AUXILIARES
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    getDeviceType() {
        const userAgent = navigator.userAgent;
        
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return 'tablet';
        }
        
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        
        return 'desktop';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        // Remover notificações existentes
        const existingNotification = document.querySelector('.sheets-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `sheets-notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">✕</button>
        `;

        document.body.appendChild(notification);

        // Auto remover após 4 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    /**
     * MÉTODOS DE STATUS
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            offlineQueueSize: this.offlineQueue.length,
            scriptUrl: this.scriptUrl,
            lastSync: localStorage.getItem('frankturbo_last_sync')
        };
    }

    // Forçar sincronização manual
    async forcSync() {
        if (this.isOnline) {
            await this.processOfflineQueue();
            localStorage.setItem('frankturbo_last_sync', new Date().toISOString());
            this.showNotification('🔄 Sincronização manual concluída!', 'success');
        } else {
            this.showNotification('❌ Sem conexão para sincronizar', 'error');
        }
    }

    // Limpar cache e dados offline
    clearOfflineData() {
        this.offlineQueue = [];
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('frankturbo_ranking_cache');
        localStorage.removeItem('frankturbo_last_sync');
        this.showNotification('🗑️ Dados offline limpos', 'info');
    }
}

// Inicializar integração global
let sheetsIntegration;

document.addEventListener('DOMContentLoaded', function() {
    sheetsIntegration = new SheetsIntegration();
    
    // Disponibilizar globalmente
    window.sheetsIntegration = sheetsIntegration;
    
    console.log('📊 Sistema Google Sheets inicializado');
});

// Adicionar estilos para notificações
const sheetsNotificationStyles = document.createElement('style');
sheetsNotificationStyles.textContent = `
    .sheets-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-dark);
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
        color: var(--text-primary);
        box-shadow: 0 10px 30px var(--shadow-color);
    }
    
    .notification-success {
        border-color: #10b981;
        background: linear-gradient(135deg, #0f172a 0%, #1e3a2e 100%);
    }
    
    .notification-info {
        border-color: var(--primary-color);
        background: var(--gradient-dark);
    }
    
    .notification-warning {
        border-color: #f59e0b;
        background: linear-gradient(135deg, #0f172a 0%, #3a2e1e 100%);
    }
    
    .notification-error {
        border-color: #ef4444;
        background: linear-gradient(135deg, #0f172a 0%, #3a1e1e 100%);
    }
    
    .sheets-notification button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.2rem;
        border-radius: 50%;
        transition: all 0.3s ease;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .sheets-notification button:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
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
        .sheets-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            min-width: auto;
            max-width: none;
        }
    }
`;
document.head.appendChild(sheetsNotificationStyles);

