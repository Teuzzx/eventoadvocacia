# 📊 Configuração Atualizada do Google Sheets para Inscrições

## Como configurar a planilha automática de inscrições (VERSÃO ATUALIZADA)

### Passo 1: Criar a Planilha
1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Nomeie como "Workshop Previdenciário - Inscrições"
4. Na primeira linha, adicione os cabeçalhos:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Data/Hora | Nome | Email | WhatsApp | OAB | Tipo Inscrição | Valor Pago | Cupom Utilizado | Desconto Aplicado | Temas de Interesse | Duração Preferida | Autoriza Contato | Comprovante | LGPD |

### Passo 2: Criar o Google Apps Script ATUALIZADO
1. Na planilha, vá em **Extensões** → **Apps Script**
2. Apague o código padrão e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    // Obter a planilha ativa
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parsear os dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    // Preparar os dados para inserir na planilha (ORDEM ATUALIZADA)
    const rowData = [
      data.timestamp || new Date().toLocaleString('pt-BR'),
      data.nome || '',
      data.email || '',
      data.whatsapp || '',
      data.oab || '',
      data.tipo_inscricao || '',
      data.valor_pago || '',
      data.cupom_utilizado || '',
      data.desconto_aplicado || '',
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

## 📈 Novos Recursos da Planilha

### Informações Adicionais Capturadas:
- **Tipo de Inscrição:** Geral ou Associadas do Centro Sul
- **Valor Pago:** R$ 100,00 ou R$ 90,00 (com desconto)
- **Cupom Utilizado:** Código do cupom (se aplicável)
- **Desconto Aplicado:** 10% ou Nenhum

### Códigos de Cupom Válidos:
- `ASSOCIADA2024`
- `CENTROSUL`
- `ADVOGADA10`

*Você pode adicionar mais códigos editando a variável `CUPONS_VALIDOS` no arquivo `script.js`*

### Fórmulas Úteis para a Planilha:

#### Contagem Total de Inscrições:
```
=COUNTA(B:B)-1
```

#### Contagem por Tipo de Inscrição:
```
=COUNTIF(F:F,"Inscrição Geral")
=COUNTIF(F:F,"Inscrição das Advogadas do Centro Sul")
```

#### Total Arrecadado:
```
=SUMPRODUCT(VALUE(SUBSTITUTE(SUBSTITUTE(G:G,"R$ ",""),",",".")))
```

#### Percentual de Descontos Aplicados:
```
=COUNTIF(I:I,"10%")/COUNTA(I:I)*100&"%"
```

## 🎯 Benefícios das Atualizações

### Para Organizadores:
- **Controle financeiro** completo das inscrições
- **Relatórios detalhados** por tipo de inscrição
- **Acompanhamento de cupons** utilizados
- **Análise de descontos** concedidos

### Para Participantes:
- **Processo simplificado** de inscrição
- **Desconto automático** para associadas
- **Confirmação imediata** do valor pago
- **Transparência** nas informações

## 🔧 Configurações Adicionais

### Personalizar Códigos de Cupom:
Edite no arquivo `script.js`:
```javascript
const CUPONS_VALIDOS = ['SEU_CODIGO1', 'SEU_CODIGO2', 'SEU_CODIGO3'];
```

### Alterar Valores:
```javascript
const VALORES = {
    geral: 100.00,        // Valor da inscrição geral
    associadas: 90.00     // Valor com desconto (10%)
};
```

---

**💡 Importante:** Certifique-se de usar os cabeçalhos corretos na planilha para que os dados sejam organizados adequadamente!
