# 🎓 Workshop Previdenciário - Sistema Completo de Inscrições

## 🆕 Novas Funcionalidades Implementadas

### ✅ 1. Dois Tipos de Inscrição
**Inscrição Geral:** R$ 100,00
- Para todos os interessados
- Valor padrão sem desconto

**Inscrição das Advogadas do Centro Sul:** R$ 90,00
- Exclusiva para associadas
- Desconto de 10% aplicado automaticamente
- Requer código de cupom válido

### ✅ 2. Sistema de Cupom de Desconto
- Campo específico para código de associada
- Validação automática de cupons
- Aplicação instantânea do desconto
- Códigos válidos: `ASSOCIADA2024`, `CENTROSUL`, `ADVOGADA10`

### ✅ 3. Logo Profissional
- Logo do Workshop substituindo o ícone anterior
- Tamanho otimizado para visualização
- Posicionamento no canto superior esquerdo

### ✅ 4. Informações de PIX Completas
- QR Code visível na página
- Nome da recebedora: **Laiane Laurinda de Sousa**
- Valor atualizado dinamicamente
- Instruções claras de pagamento

### ✅ 5. Preview Visual de Arquivos
- Miniatura para imagens (JPG, PNG)
- Informações detalhadas para PDFs
- Validação de tamanho e formato
- Interface drag & drop

### ✅ 6. Integração Completa com Planilha
Dados salvos automaticamente:
- Tipo de inscrição selecionado
- Valor pago (com ou sem desconto)
- Código de cupom utilizado
- Percentual de desconto aplicado
- Status do comprovante
- Todos os dados pessoais

### ✅ 7. E-mails e WhatsApp Detalhados
- Informações completas de pagamento
- Detalhes do desconto (se aplicável)
- Status do comprovante
- Nome da recebedora PIX

## 🎯 Como Usar o Sistema

### Para o Usuário:
1. **Escolher tipo de inscrição** clicando em um dos botões
2. **Preencher dados pessoais** no formulário
3. **Aplicar cupom** (se for associada)
4. **Verificar valor final** na seção PIX
5. **Fazer pagamento** via QR Code
6. **Anexar comprovante** com preview visual
7. **Enviar formulário** e receber confirmação

### Para o Organizador:
1. **Acompanhar inscrições** em tempo real na planilha
2. **Controlar valores** arrecadados por tipo
3. **Verificar cupons** utilizados
4. **Receber notificações** por email e WhatsApp
5. **Gerenciar comprovantes** anexados

## ⚙️ Configuração Necessária

### 1. Arquivo `script.js`
```javascript
// Email para receber inscrições
const EMAIL_DESTINO = 'seu@email.com';

// WhatsApp para notificações
const WHATSAPP_NUMERO = '5511999999999';

// URL do Google Apps Script
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/SEU_ID/exec';
```

### 2. Google Sheets
- Siga as instruções em `INSTRUCOES_GOOGLE_SHEETS_ATUALIZADO.md`
- Use os cabeçalhos corretos na planilha
- Configure o Google Apps Script

### 3. Códigos de Cupom
```javascript
const CUPONS_VALIDOS = ['ASSOCIADA2024', 'CENTROSUL', 'ADVOGADA10'];
```

### 4. Valores das Inscrições
```javascript
const VALORES = {
    geral: 100.00,
    associadas: 90.00
};
```

## 📁 Arquivos Inclusos

- `index.html` - Página principal atualizada
- `script.js` - JavaScript com todas as funcionalidades
- `styles.css` - CSS com novos estilos
- `logo.png` - Logo do Workshop
- `qrcode.jpg` - QR Code para pagamento PIX
- `INSTRUCOES_GOOGLE_SHEETS_ATUALIZADO.md` - Guia da planilha
- `README_COMPLETO.md` - Este arquivo

## 🎨 Design e Experiência

### Paleta de Cores Mantida:
- **Dourado:** #d4af37 (Inscrição Geral)
- **Azul:** #2c5aa0 (Inscrição Associadas)
- **Cinza escuro:** #1a1a2e (Textos)

### Funcionalidades Visuais:
- Botões diferenciados por tipo
- Animações suaves
- Feedback visual imediato
- Layout responsivo
- Preview de arquivos

## 📊 Relatórios da Planilha

### Métricas Disponíveis:
- Total de inscrições por tipo
- Valor total arrecadado
- Quantidade de cupons utilizados
- Percentual de descontos aplicados
- Status de comprovantes enviados

### Fórmulas Úteis:
```
Total Inscrições: =COUNTA(B:B)-1
Inscrições Gerais: =COUNTIF(F:F,"Inscrição Geral")
Inscrições Associadas: =COUNTIF(F:F,"Inscrição das Advogadas do Centro Sul")
Total Arrecadado: =SUMPRODUCT(VALUE(SUBSTITUTE(SUBSTITUTE(G:G,"R$ ",""),",",".")))
```

## 🔒 Segurança e Validação

### Validações Implementadas:
- Campos obrigatórios
- Formato de email
- Tamanho de arquivos (máx. 5MB)
- Códigos de cupom válidos
- Seleção de tipo de inscrição

### Proteção de Dados:
- Consentimento LGPD obrigatório
- Dados criptografados em trânsito
- Planilha privada
- Backup automático

## 🚀 Benefícios do Sistema

### Automatização:
- Cálculo automático de descontos
- Validação de cupons em tempo real
- Salvamento automático na planilha
- Envio automático de confirmações

### Controle:
- Acompanhamento em tempo real
- Relatórios detalhados
- Gestão de comprovantes
- Controle financeiro completo

### Experiência do Usuário:
- Interface intuitiva
- Feedback imediato
- Preview de arquivos
- Processo simplificado

---

**🎉 Sistema completo e pronto para uso!** Todas as funcionalidades solicitadas foram implementadas com sucesso.
