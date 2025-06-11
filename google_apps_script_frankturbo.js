/**
 * GARAGEM DO FRANK - GOOGLE APPS SCRIPT
 * Sistema completo de integração com Google Sheets
 * Autor: Luna (Manus AI)
 * Data: 2024
 */

// CONFIGURAÇÕES PRINCIPAIS
const CONFIG = {
  // IDs das planilhas (você deve substituir pelos IDs reais)
  SPREADSHEET_ID: 'SEU_SPREADSHEET_ID_AQUI',
  
  // Nomes das abas
  SHEETS: {
    RANKING: 'Ranking_Mundial',
    USUARIOS: 'Usuarios_Cadastrados', 
    CONTATOS: 'Contatos_Leads',
    PEDIDOS: 'Pedidos_Loja',
    DOACOES: 'Doacoes_Apoio',
    ESTATISTICAS: 'Estatisticas_Gerais',
    LOG: 'Log_Sistema'
  },
  
  // Email para notificações
  ADMIN_EMAIL: 'frank@garagemfrank.com',
  
  // Configurações de segurança
  ALLOWED_ORIGINS: [
    'https://bumasjlv.manus.space',
    'https://frankturbo.com',
    'https://www.frankturbo.com'
  ]
};

/**
 * FUNÇÃO PRINCIPAL - Recebe todas as requisições
 */
function doPost(e) {
  try {
    // Verificar origem da requisição
    const origin = e.parameter.origin || e.postData?.origin;
    if (!isOriginAllowed(origin)) {
      return createResponse(false, 'Origem não autorizada', 403);
    }
    
    // Parse dos dados
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Log da requisição
    logRequest(action, data, origin);
    
    // Roteamento das ações
    switch (action) {
      case 'save_ranking':
        return saveRanking(data);
      case 'get_ranking':
        return getRanking(data);
      case 'save_user':
        return saveUser(data);
      case 'save_contact':
        return saveContact(data);
      case 'save_order':
        return saveOrder(data);
      case 'save_donation':
        return saveDonation(data);
      case 'get_stats':
        return getStats(data);
      case 'backup_data':
        return backupData(data);
      default:
        return createResponse(false, 'Ação não reconhecida', 400);
    }
    
  } catch (error) {
    console.error('Erro no doPost:', error);
    logError('doPost', error);
    return createResponse(false, 'Erro interno do servidor', 500);
  }
}

/**
 * FUNÇÃO GET - Para requisições simples
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case 'get_ranking':
        return getRanking({});
      case 'get_stats':
        return getStats({});
      case 'health_check':
        return createResponse(true, 'Sistema funcionando', 200);
      default:
        return createResponse(false, 'Ação GET não reconhecida', 400);
    }
    
  } catch (error) {
    console.error('Erro no doGet:', error);
    return createResponse(false, 'Erro interno do servidor', 500);
  }
}

/**
 * FUNÇÕES DE RANKING MUNDIAL
 */
function saveRanking(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.RANKING);
    
    // Dados do ranking
    const rankingData = [
      new Date(),
      data.nick || '',
      data.time || 0,
      data.location || 'Brasil',
      data.device || 'Desktop',
      data.ip || '',
      data.userAgent || ''
    ];
    
    // Adicionar linha
    sheet.appendRow(rankingData);
    
    // Ordenar por tempo (coluna C)
    const range = sheet.getDataRange();
    if (range.getNumRows() > 1) {
      range.sort(3); // Ordenar pela coluna do tempo
    }
    
    // Manter apenas top 100
    if (sheet.getLastRow() > 101) { // 1 header + 100 dados
      sheet.deleteRows(102, sheet.getLastRow() - 101);
    }
    
    // Atualizar estatísticas
    updateStats('ranking_updated');
    
    // Verificar se é novo recorde
    const isNewRecord = sheet.getLastRow() === 2 || 
                       data.time < sheet.getRange(2, 3).getValue();
    
    if (isNewRecord) {
      sendNotification('Novo Recorde!', 
        `${data.nick} fez ${data.time}s no simulador!`);
    }
    
    return createResponse(true, 'Ranking salvo com sucesso', 200, {
      position: getPlayerPosition(data.nick, data.time),
      isNewRecord: isNewRecord
    });
    
  } catch (error) {
    logError('saveRanking', error);
    return createResponse(false, 'Erro ao salvar ranking', 500);
  }
}

function getRanking(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.RANKING);
    const range = sheet.getDataRange();
    
    if (range.getNumRows() <= 1) {
      return createResponse(true, 'Ranking vazio', 200, []);
    }
    
    const values = range.getValues();
    const headers = values[0];
    const dataRows = values.slice(1);
    
    // Limitar aos top 10
    const topRankings = dataRows.slice(0, 10).map((row, index) => ({
      position: index + 1,
      date: row[0],
      nick: row[1],
      time: row[2],
      location: row[3],
      device: row[4]
    }));
    
    return createResponse(true, 'Ranking obtido com sucesso', 200, topRankings);
    
  } catch (error) {
    logError('getRanking', error);
    return createResponse(false, 'Erro ao obter ranking', 500);
  }
}

/**
 * FUNÇÕES DE USUÁRIOS
 */
function saveUser(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.USUARIOS);
    
    // Verificar se usuário já existe
    const existingUser = findUserByEmail(data.email);
    if (existingUser) {
      return createResponse(false, 'Usuário já cadastrado', 409);
    }
    
    const userData = [
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.nick || '',
      data.location || '',
      data.source || 'portal',
      'ativo'
    ];
    
    sheet.appendRow(userData);
    updateStats('user_registered');
    
    // Enviar email de boas-vindas
    sendWelcomeEmail(data.email, data.name);
    
    return createResponse(true, 'Usuário cadastrado com sucesso', 200);
    
  } catch (error) {
    logError('saveUser', error);
    return createResponse(false, 'Erro ao cadastrar usuário', 500);
  }
}

/**
 * FUNÇÕES DE CONTATO
 */
function saveContact(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.CONTATOS);
    
    const contactData = [
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.subject || '',
      data.message || '',
      data.source || 'portal',
      'novo'
    ];
    
    sheet.appendRow(contactData);
    updateStats('contact_received');
    
    // Notificar admin
    sendNotification('Novo Contato!', 
      `${data.name} enviou uma mensagem: ${data.subject}`);
    
    return createResponse(true, 'Contato salvo com sucesso', 200);
    
  } catch (error) {
    logError('saveContact', error);
    return createResponse(false, 'Erro ao salvar contato', 500);
  }
}

/**
 * FUNÇÕES DE PEDIDOS DA LOJA
 */
function saveOrder(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PEDIDOS);
    
    const orderData = [
      new Date(),
      data.orderNumber || generateOrderNumber(),
      data.customerName || '',
      data.customerEmail || '',
      data.customerPhone || '',
      JSON.stringify(data.items || []),
      data.total || 0,
      data.paymentMethod || '',
      'pendente'
    ];
    
    sheet.appendRow(orderData);
    updateStats('order_received');
    
    // Notificar admin
    sendNotification('Novo Pedido!', 
      `Pedido #${orderData[1]} - R$ ${data.total}`);
    
    return createResponse(true, 'Pedido salvo com sucesso', 200, {
      orderNumber: orderData[1]
    });
    
  } catch (error) {
    logError('saveOrder', error);
    return createResponse(false, 'Erro ao salvar pedido', 500);
  }
}

/**
 * FUNÇÕES DE DOAÇÕES
 */
function saveDonation(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.DOACOES);
    
    const donationData = [
      new Date(),
      data.donorName || 'Anônimo',
      data.donorEmail || '',
      data.amount || 0,
      data.method || 'PIX',
      data.message || '',
      data.isPublic || false,
      'confirmado'
    ];
    
    sheet.appendRow(donationData);
    updateStats('donation_received');
    
    // Notificar admin
    sendNotification('Nova Doação!', 
      `${data.donorName} doou R$ ${data.amount}`);
    
    return createResponse(true, 'Doação registrada com sucesso', 200);
    
  } catch (error) {
    logError('saveDonation', error);
    return createResponse(false, 'Erro ao registrar doação', 500);
  }
}

/**
 * FUNÇÕES DE ESTATÍSTICAS
 */
function getStats(data) {
  try {
    const stats = {
      ranking: getSheetStats(CONFIG.SHEETS.RANKING),
      users: getSheetStats(CONFIG.SHEETS.USUARIOS),
      contacts: getSheetStats(CONFIG.SHEETS.CONTATOS),
      orders: getSheetStats(CONFIG.SHEETS.PEDIDOS),
      donations: getSheetStats(CONFIG.SHEETS.DOACOES),
      lastUpdate: new Date()
    };
    
    return createResponse(true, 'Estatísticas obtidas', 200, stats);
    
  } catch (error) {
    logError('getStats', error);
    return createResponse(false, 'Erro ao obter estatísticas', 500);
  }
}

function updateStats(action) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ESTATISTICAS);
    
    const statsData = [
      new Date(),
      action,
      1,
      getClientInfo()
    ];
    
    sheet.appendRow(statsData);
    
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

/**
 * FUNÇÕES AUXILIARES
 */
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = createSheet(spreadsheet, sheetName);
  }
  
  return sheet;
}

function createSheet(spreadsheet, sheetName) {
  const sheet = spreadsheet.insertSheet(sheetName);
  
  // Configurar headers baseado no tipo de sheet
  const headers = getSheetHeaders(sheetName);
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  return sheet;
}

function getSheetHeaders(sheetName) {
  const headerMap = {
    [CONFIG.SHEETS.RANKING]: ['Data', 'Nick', 'Tempo', 'Localização', 'Dispositivo', 'IP', 'User Agent'],
    [CONFIG.SHEETS.USUARIOS]: ['Data', 'Nome', 'Email', 'Telefone', 'Nick', 'Localização', 'Origem', 'Status'],
    [CONFIG.SHEETS.CONTATOS]: ['Data', 'Nome', 'Email', 'Telefone', 'Assunto', 'Mensagem', 'Origem', 'Status'],
    [CONFIG.SHEETS.PEDIDOS]: ['Data', 'Número', 'Nome', 'Email', 'Telefone', 'Itens', 'Total', 'Pagamento', 'Status'],
    [CONFIG.SHEETS.DOACOES]: ['Data', 'Nome', 'Email', 'Valor', 'Método', 'Mensagem', 'Público', 'Status'],
    [CONFIG.SHEETS.ESTATISTICAS]: ['Data', 'Ação', 'Quantidade', 'Info Cliente'],
    [CONFIG.SHEETS.LOG]: ['Data', 'Tipo', 'Ação', 'Dados', 'Erro', 'IP']
  };
  
  return headerMap[sheetName] || [];
}

function createResponse(success, message, code, data = null) {
  const response = {
    success: success,
    message: message,
    code: code,
    timestamp: new Date(),
    data: data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.some(allowed => 
    origin.includes(allowed) || allowed.includes(origin)
  );
}

function logRequest(action, data, origin) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.LOG);
    
    const logData = [
      new Date(),
      'REQUEST',
      action,
      JSON.stringify(data).substring(0, 500), // Limitar tamanho
      '',
      origin || ''
    ];
    
    sheet.appendRow(logData);
    
  } catch (error) {
    console.error('Erro ao fazer log:', error);
  }
}

function logError(action, error) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.LOG);
    
    const logData = [
      new Date(),
      'ERROR',
      action,
      '',
      error.toString(),
      ''
    ];
    
    sheet.appendRow(logData);
    
  } catch (logError) {
    console.error('Erro ao fazer log de erro:', logError);
  }
}

function sendNotification(subject, message) {
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: `[Garagem do Frank] ${subject}`,
      body: message
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

function sendWelcomeEmail(email, name) {
  try {
    const subject = 'Bem-vindo à Garagem do Frank!';
    const body = `
Olá ${name}!

Seja bem-vindo à comunidade da Garagem do Frank!

Agora você faz parte da nossa família automotiva e terá acesso a:
- Conteúdo exclusivo
- Promoções especiais
- Ranking mundial do simulador
- E muito mais!

Visite nosso portal: https://frankturbo.com

Abraços,
Equipe Garagem do Frank
    `;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
  }
}

function generateOrderNumber() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `GF${timestamp}${random}`;
}

function getClientInfo() {
  // Informações básicas do cliente
  return JSON.stringify({
    timestamp: new Date(),
    source: 'google_apps_script'
  });
}

function findUserByEmail(email) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.USUARIOS);
    const range = sheet.getDataRange();
    
    if (range.getNumRows() <= 1) return null;
    
    const values = range.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][2] === email) { // Coluna do email
        return values[i];
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

function getPlayerPosition(nick, time) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.RANKING);
    const range = sheet.getDataRange();
    
    if (range.getNumRows() <= 1) return 1;
    
    const values = range.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === nick && values[i][2] === time) {
        return i; // Posição (considerando header)
      }
    }
    
    return values.length; // Última posição
    
  } catch (error) {
    console.error('Erro ao obter posição:', error);
    return 0;
  }
}

function getSheetStats(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    
    return {
      total: Math.max(0, lastRow - 1), // Excluir header
      lastUpdate: lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : null
    };
    
  } catch (error) {
    console.error(`Erro ao obter stats de ${sheetName}:`, error);
    return { total: 0, lastUpdate: null };
  }
}

/**
 * FUNÇÃO DE BACKUP AUTOMÁTICO
 */
function backupData(data) {
  try {
    const backupFolder = DriveApp.createFolder(`Backup_GaragemFrank_${new Date().toISOString().split('T')[0]}`);
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Fazer cópia da planilha
    const backupFile = spreadsheet.copy(`Backup_${new Date().getTime()}`);
    backupFile.moveTo(backupFolder);
    
    return createResponse(true, 'Backup realizado com sucesso', 200, {
      backupId: backupFile.getId(),
      folderId: backupFolder.getId()
    });
    
  } catch (error) {
    logError('backupData', error);
    return createResponse(false, 'Erro ao fazer backup', 500);
  }
}

/**
 * TRIGGER PARA BACKUP AUTOMÁTICO DIÁRIO
 */
function createDailyBackupTrigger() {
  ScriptApp.newTrigger('dailyBackup')
    .timeBased()
    .everyDays(1)
    .atHour(3) // 3h da manhã
    .create();
}

function dailyBackup() {
  backupData({});
}

