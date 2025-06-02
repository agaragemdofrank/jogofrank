# Plano de Alterações para o Simulador Garagem do Frank

## Alterações Visuais
1. **Renomear o jogo**
   - Alterar título de "Simulador de Pinheirinho de Arrancada" para "Simulador Garagem do Frank"
   - Atualizar título na página e no footer

2. **Implementar novo pinheirinho**
   - Reestruturar o HTML para o formato Armageddon:
     - Adicionar luzes de pré-stage (2 pares amarelos)
     - Adicionar luzes de stage (2 pares amarelos)
     - Manter 3 pares de luzes amarelas principais
     - Manter 1 par de luzes verdes
     - Manter 1 par de luzes vermelhas
   - Ajustar o CSS para o novo layout

3. **Adicionar logo**
   - Inserir a logo da Garagem do Frank no topo da página
   - Garantir que a logo tenha destaque e seja responsiva

## Alterações Funcionais
1. **Calcular tempo de reação negativo para queimadas**
   - Modificar a função `falseLaunch()` para calcular quanto tempo antes da luz verde o usuário reagiu
   - Armazenar esse valor como um número negativo

2. **Exibir tempos de queimada em vermelho**
   - Alterar a exibição dos tempos de queimada na lista de últimos tempos
   - Mostrar o valor negativo em vermelho (ex: "-0.245s")
   - Substituir o texto "Largada queimada" por valores numéricos negativos

## Arquivos a Modificar
1. **index.html**
   - Atualizar título e estrutura do pinheirinho
   - Adicionar logo
   - Ajustar layout geral

2. **style.css**
   - Atualizar estilos para o novo pinheirinho
   - Adicionar estilos para a logo
   - Adicionar classe para tempos negativos em vermelho

3. **script.js**
   - Modificar lógica de detecção de queimada para calcular tempo negativo
   - Atualizar função de exibição de tempos para mostrar valores negativos em vermelho
   - Ajustar sequência de luzes para o novo formato do pinheirinho
