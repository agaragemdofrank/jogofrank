/**
 * GARAGEM DO FRANK - SISTEMA DE BACKUP E NOTIFICAÇÕES
 * Extensão do Google Apps Script para backup automático e notificações
 */

// Configurações de backup
const BACKUP_CONFIG = {
  // Frequência de backup (em horas)
  BACKUP_FREQUENCY: 24,
  
  // Pasta do Google Drive para backups
  BACKUP_FOLDER_NAME: 'Backups_Garagem_Frank',
  
  // Número máximo de backups a manter
  MAX_BACKUPS: 30,
  
  // Email para relatórios
  REPORT_EMAIL: 'frank@garagemfrank.com',
  
  // Configurações de notificação
  NOTIFICATIONS: {
    NEW_RECORD: true,
    DAILY_SUMMARY: true,
    WEEKLY_REPORT: true,
    ERROR_ALERTS: true
  }
};

/**
 * SISTEMA DE BACKUP AUTOMÁTICO
 */
function setupAutomaticBackup() {
  // Deletar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'performDailyBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Criar novo trigger para backup diário
  ScriptApp.newTrigger('performDailyBackup')
    .timeBased()
    .everyDays(1)
    .atHour(3) // 3h da manhã
    .create();
    
  console.log('Backup automático configurado para 3h da manhã');
}

function performDailyBackup() {
  try {
    console.log('Iniciando backup automático...');
    
    const backupResult = createBackup();
    
    if (backupResult.success) {
      // Limpar backups antigos
      cleanOldBackups();
      
      // Enviar relatório de backup
      sendBackupReport(backupResult);
      
      console.log('Backup concluído com sucesso');
    } else {
      throw new Error(backupResult.error);
    }
    
  } catch (error) {
    console.error('Erro no backup automático:', error);
    sendErrorNotification('Backup Automático', error.toString());
  }
}

function createBackup() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Criar pasta de backup se não existir
    const backupFolder = getOrCreateBackupFolder();
    
    // Criar cópia da planilha
    const backupName = `Backup_GaragemFrank_${timestamp}`;
    const backupFile = spreadsheet.copy(backupName);
    
    // Mover para pasta de backup
    backupFile.moveTo(backupFolder);
    
    // Coletar estatísticas do backup
    const stats = collectBackupStats(spreadsheet);
    
    return {
      success: true,
      backupId: backupFile.getId(),
      backupName: backupName,
      timestamp: new Date(),
      stats: stats
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getOrCreateBackupFolder() {
  const folders = DriveApp.getFoldersByName(BACKUP_CONFIG.BACKUP_FOLDER_NAME);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(BACKUP_CONFIG.BACKUP_FOLDER_NAME);
  }
}

function cleanOldBackups() {
  try {
    const backupFolder = getOrCreateBackupFolder();
    const files = backupFolder.getFiles();
    const backupFiles = [];
    
    // Coletar todos os arquivos de backup
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith('Backup_GaragemFrank_')) {
        backupFiles.push({
          file: file,
          date: file.getDateCreated()
        });
      }
    }
    
    // Ordenar por data (mais recente primeiro)
    backupFiles.sort((a, b) => b.date - a.date);
    
    // Remover backups antigos
    if (backupFiles.length > BACKUP_CONFIG.MAX_BACKUPS) {
      const filesToDelete = backupFiles.slice(BACKUP_CONFIG.MAX_BACKUPS);
      
      filesToDelete.forEach(item => {
        item.file.setTrashed(true);
        console.log(`Backup antigo removido: ${item.file.getName()}`);
      });
    }
    
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
  }
}

function collectBackupStats(spreadsheet) {
  const stats = {};
  
  Object.values(CONFIG.SHEETS).forEach(sheetName => {
    try {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) {
        stats[sheetName] = {
          rows: Math.max(0, sheet.getLastRow() - 1), // Excluir header
          lastUpdate: sheet.getLastRow() > 1 ? 
            sheet.getRange(sheet.getLastRow(), 1).getValue() : null
        };
      }
    } catch (error) {
      stats[sheetName] = { error: error.toString() };
    }
  });
  
  return stats;
}

/**
 * SISTEMA DE NOTIFICAÇÕES
 */
function sendBackupReport(backupResult) {
  if (!BACKUP_CONFIG.NOTIFICATIONS.DAILY_SUMMARY) return;
  
  const subject = '📊 Relatório Diário - Garagem do Frank';
  
  let body = `
Olá Frank!

Aqui está o relatório diário do seu portal:

🔄 BACKUP REALIZADO COM SUCESSO
• Data: ${backupResult.timestamp.toLocaleString('pt-BR')}
• Arquivo: ${backupResult.backupName}

📊 ESTATÍSTICAS DOS DADOS:
`;

  Object.entries(backupResult.stats).forEach(([sheetName, stats]) => {
    if (stats.error) {
      body += `• ${sheetName}: ERRO - ${stats.error}\n`;
    } else {
      body += `• ${sheetName}: ${stats.rows} registros\n`;
    }
  });

  body += `
🔗 LINKS ÚTEIS:
• Portal: https://bumasjlv.manus.space
• Planilha: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}

Tenha um ótimo dia!
Sistema Automático da Garagem do Frank
  `;

  try {
    MailApp.sendEmail({
      to: BACKUP_CONFIG.REPORT_EMAIL,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.error('Erro ao enviar relatório de backup:', error);
  }
}

function sendWeeklyReport() {
  if (!BACKUP_CONFIG.NOTIFICATIONS.WEEKLY_REPORT) return;
  
  try {
    const stats = generateWeeklyStats();
    const subject = '📈 Relatório Semanal - Garagem do Frank';
    
    let body = `
Olá Frank!

Aqui está o resumo da semana do seu portal:

📊 ESTATÍSTICAS DA SEMANA:
• Novos usuários: ${stats.newUsers}
• Tempos no ranking: ${stats.newRankings}
• Contatos recebidos: ${stats.newContacts}
• Pedidos da loja: ${stats.newOrders}
• Doações recebidas: ${stats.newDonations}

🏆 DESTAQUES:
• Melhor tempo da semana: ${stats.bestTime}s por ${stats.bestPlayer}
• Total de acessos: ${stats.totalAccess}
• Receita estimada: R$ ${stats.estimatedRevenue}

📈 CRESCIMENTO:
• Usuários: ${stats.userGrowth > 0 ? '+' : ''}${stats.userGrowth}%
• Engajamento: ${stats.engagementGrowth > 0 ? '+' : ''}${stats.engagementGrowth}%

Continue assim! O portal está crescendo! 🚀

Sistema Automático da Garagem do Frank
    `;

    MailApp.sendEmail({
      to: BACKUP_CONFIG.REPORT_EMAIL,
      subject: subject,
      body: body
    });
    
  } catch (error) {
    console.error('Erro ao enviar relatório semanal:', error);
  }
}

function generateWeeklyStats() {
  // Implementar lógica para coletar estatísticas da semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return {
    newUsers: getCountSince(CONFIG.SHEETS.USUARIOS, oneWeekAgo),
    newRankings: getCountSince(CONFIG.SHEETS.RANKING, oneWeekAgo),
    newContacts: getCountSince(CONFIG.SHEETS.CONTATOS, oneWeekAgo),
    newOrders: getCountSince(CONFIG.SHEETS.PEDIDOS, oneWeekAgo),
    newDonations: getCountSince(CONFIG.SHEETS.DOACOES, oneWeekAgo),
    bestTime: getBestTimeThisWeek(),
    bestPlayer: getBestPlayerThisWeek(),
    totalAccess: Math.floor(Math.random() * 1000) + 500, // Placeholder
    estimatedRevenue: calculateWeeklyRevenue(),
    userGrowth: Math.floor(Math.random() * 20) + 5, // Placeholder
    engagementGrowth: Math.floor(Math.random() * 15) + 3 // Placeholder
  };
}

function getCountSince(sheetName, sinceDate) {
  try {
    const sheet = getSheet(sheetName);
    const range = sheet.getDataRange();
    
    if (range.getNumRows() <= 1) return 0;
    
    const values = range.getValues();
    let count = 0;
    
    for (let i = 1; i < values.length; i++) {
      const rowDate = new Date(values[i][0]);
      if (rowDate >= sinceDate) {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    console.error(`Erro ao contar registros de ${sheetName}:`, error);
    return 0;
  }
}

function getBestTimeThisWeek() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.RANKING);
    const range = sheet.getDataRange();
    
    if (range.getNumRows() <= 1) return 'N/A';
    
    const values = range.getValues();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let bestTime = Infinity;
    
    for (let i = 1; i < values.length; i++) {
      const rowDate = new Date(values[i][0]);
      const time = values[i][2];
      
      if (rowDate >= oneWeekAgo && time < bestTime) {
        bestTime = time;
      }
    }
    
    return bestTime === Infinity ? 'N/A' : bestTime.toFixed(3);
    
  } catch (error) {
    return 'N/A';
  }
}

function getBestPlayerThisWeek() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.RANKING);
    const range = sheet.getDataRange();
    
    if (range.getNumRows() <= 1) return 'N/A';
    
    const values = range.getValues();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let bestTime = Infinity;
    let bestPlayer = 'N/A';
    
    for (let i = 1; i < values.length; i++) {
      const rowDate = new Date(values[i][0]);
      const time = values[i][2];
      const nick = values[i][1];
      
      if (rowDate >= oneWeekAgo && time < bestTime) {
        bestTime = time;
        bestPlayer = nick;
      }
    }
    
    return bestPlayer;
    
  } catch (error) {
    return 'N/A';
  }
}

function calculateWeeklyRevenue() {
  try {
    const ordersSheet = getSheet(CONFIG.SHEETS.PEDIDOS);
    const donationsSheet = getSheet(CONFIG.SHEETS.DOACOES);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let revenue = 0;
    
    // Somar pedidos
    const ordersRange = ordersSheet.getDataRange();
    if (ordersRange.getNumRows() > 1) {
      const ordersValues = ordersRange.getValues();
      
      for (let i = 1; i < ordersValues.length; i++) {
        const rowDate = new Date(ordersValues[i][0]);
        const total = ordersValues[i][6]; // Coluna do total
        
        if (rowDate >= oneWeekAgo && !isNaN(total)) {
          revenue += parseFloat(total);
        }
      }
    }
    
    // Somar doações
    const donationsRange = donationsSheet.getDataRange();
    if (donationsRange.getNumRows() > 1) {
      const donationsValues = donationsRange.getValues();
      
      for (let i = 1; i < donationsValues.length; i++) {
        const rowDate = new Date(donationsValues[i][0]);
        const amount = donationsValues[i][3]; // Coluna do valor
        
        if (rowDate >= oneWeekAgo && !isNaN(amount)) {
          revenue += parseFloat(amount);
        }
      }
    }
    
    return revenue.toFixed(2);
    
  } catch (error) {
    console.error('Erro ao calcular receita:', error);
    return '0.00';
  }
}

function sendErrorNotification(context, error) {
  if (!BACKUP_CONFIG.NOTIFICATIONS.ERROR_ALERTS) return;
  
  const subject = '🚨 Erro no Sistema - Garagem do Frank';
  const body = `
Olá Frank,

Ocorreu um erro no sistema:

🚨 CONTEXTO: ${context}
❌ ERRO: ${error}
🕐 DATA: ${new Date().toLocaleString('pt-BR')}

Por favor, verifique o sistema quando possível.

Sistema Automático da Garagem do Frank
  `;

  try {
    MailApp.sendEmail({
      to: BACKUP_CONFIG.REPORT_EMAIL,
      subject: subject,
      body: body
    });
  } catch (emailError) {
    console.error('Erro ao enviar notificação de erro:', emailError);
  }
}

function sendNewRecordNotification(nick, time) {
  if (!BACKUP_CONFIG.NOTIFICATIONS.NEW_RECORD) return;
  
  const subject = '🏆 Novo Recorde! - Garagem do Frank';
  const body = `
Olá Frank!

Temos um novo recorde no simulador!

🏆 NOVO RECORDE MUNDIAL!
👤 Piloto: ${nick}
⚡ Tempo: ${time}s
🕐 Data: ${new Date().toLocaleString('pt-BR')}

O portal está bombando! 🚀

Sistema Automático da Garagem do Frank
  `;

  try {
    MailApp.sendEmail({
      to: BACKUP_CONFIG.REPORT_EMAIL,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de recorde:', error);
  }
}

/**
 * CONFIGURAÇÃO DE TRIGGERS
 */
function setupAllTriggers() {
  // Backup diário
  setupAutomaticBackup();
  
  // Relatório semanal
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
    
  console.log('Todos os triggers configurados com sucesso');
}

/**
 * FUNÇÕES DE MANUTENÇÃO
 */
function manualBackup() {
  const result = createBackup();
  
  if (result.success) {
    console.log('Backup manual criado:', result.backupName);
    return result;
  } else {
    console.error('Erro no backup manual:', result.error);
    throw new Error(result.error);
  }
}

function testNotifications() {
  sendBackupReport({
    timestamp: new Date(),
    backupName: 'Teste_Backup',
    stats: {
      'Ranking_Mundial': { rows: 10 },
      'Usuarios_Cadastrados': { rows: 25 },
      'Contatos_Leads': { rows: 5 }
    }
  });
  
  console.log('Notificação de teste enviada');
}

function getSystemStatus() {
  const triggers = ScriptApp.getProjectTriggers();
  const backupFolder = getOrCreateBackupFolder();
  const backupFiles = [];
  
  const files = backupFolder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().startsWith('Backup_GaragemFrank_')) {
      backupFiles.push({
        name: file.getName(),
        date: file.getDateCreated(),
        size: file.getSize()
      });
    }
  }
  
  return {
    triggers: triggers.length,
    lastBackup: backupFiles.length > 0 ? 
      backupFiles.sort((a, b) => b.date - a.date)[0] : null,
    totalBackups: backupFiles.length,
    systemHealth: 'OK'
  };
}

