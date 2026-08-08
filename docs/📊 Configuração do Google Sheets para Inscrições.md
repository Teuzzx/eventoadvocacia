# 📊 Configuração do Google Sheets para Inscrições

## Como configurar a planilha automática de inscrições

### Passo 1: Criar a Planilha
1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Nomeie como "Workshop Previdenciário - Inscrições"
4. Na primeira linha, adicione os cabeçalhos:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Data/Hora | Nome | Email | WhatsApp | OAB | Temas de Interesse | Duração Preferida | Autoriza Contato | Comprovante | LGPD |

### Passo 2: Criar o Google Apps Script
1. Na planilha, vá em **Extensões** → **Apps Script**
2. Apague o código padrão e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    // Obter a planilha ativa
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parsear os dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    // Preparar os dados para inserir na planilha
    const rowData = [
      data.timestamp || new Date().toLocaleString('pt-BR'),
      data.nome || '',
      data.email || '',
      data.whatsapp || '',
      data.oab || '',
      data.temas_interesse || '',
      data.duracao_preferida || '',
      data.autoriza_contato || '',
      data.comprovante_anexado || '',
      data.lgpd_aceito || ''
    ];
    
    // Inserir os dados na planilha
    sheet.appendRow(rowData);
    
    // Retornar sucesso
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success', message: 'Dados salvos com sucesso'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar erro
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success', message: 'API funcionando'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Passo 3: Publicar o Script
1. Clique em **Implantar** → **Nova implantação**
2. Em "Tipo", selecione **Aplicativo da Web**
3. Em "Executar como", selecione **Eu**
4. Em "Quem tem acesso", selecione **Qualquer pessoa**
5. Clique em **Implantar**
6. **COPIE A URL** que aparece (algo como: `https://script.google.com/macros/s/ABC123.../exec`)

### Passo 4: Configurar no Site
1. Abra o arquivo `script.js`
2. Encontre a linha com `GOOGLE_SHEETS_URL`
3. Substitua `SEU_SCRIPT_ID_AQUI` pela URL copiada no passo anterior

```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/SUA_URL_AQUI/exec';
```

### Passo 5: Testar
1. Faça uma inscrição de teste no site
2. Verifique se os dados aparecem na planilha
3. Se não funcionar, verifique o console do navegador (F12)

## 📈 Recursos Adicionais da Planilha

### Contagem Automática de Inscrições
Adicione em uma célula vazia:
```
=COUNTA(B:B)-1
```
(Conta quantas pessoas se inscreveram)

### Filtros por Status de Pagamento
Use a função de filtro do Google Sheets na coluna "Comprovante" para ver:
- Quem já enviou comprovante
- Quem ainda não enviou

### Gráficos Automáticos
1. Selecione os dados
2. Vá em **Inserir** → **Gráfico**
3. Crie gráficos de:
   - Inscrições por dia
   - Preferências de duração
   - Status de pagamento

## 🔒 Segurança e Privacidade

- A planilha é privada (apenas você tem acesso)
- Os dados são enviados de forma segura via HTTPS
- Respeita a LGPD (dados só são salvos com consentimento)

## 🆘 Solução de Problemas

### Erro "Script não encontrado"
- Verifique se a URL está correta
- Certifique-se de que o script foi publicado

### Dados não aparecem na planilha
- Verifique se os cabeçalhos estão corretos
- Teste o script diretamente no Apps Script

### Erro de permissão
- Certifique-se de que o script está configurado para "Qualquer pessoa"
- Reautorize o script se necessário

---

**💡 Dica:** Mantenha a planilha aberta em uma aba para acompanhar as inscrições em tempo real!
