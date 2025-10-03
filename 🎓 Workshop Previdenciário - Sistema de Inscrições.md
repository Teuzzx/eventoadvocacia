# 🎓 Workshop Previdenciário - Sistema de Inscrições

## 📋 Melhorias Implementadas

### ✅ 1. Preview Visual de Arquivos
O sistema agora exibe **preview visual** dos arquivos enviados:

**Para Imagens (JPG, PNG):**
- Miniatura da imagem é exibida
- Informações do arquivo (nome e tamanho)
- Botão para remover arquivo

**Para PDFs:**
- Ícone de PDF estilizado
- Informações do documento
- Confirmação de carregamento

**Funcionalidades:**
- Drag & drop funcional
- Validação de tamanho (máx. 5MB)
- Validação de formato
- Loading state durante carregamento
- Tratamento de erros

### ✅ 2. Integração com Planilha Excel Online
Sistema automatizado para registrar inscrições em **Google Sheets**:

**Dados Salvos Automaticamente:**
- Data/Hora da inscrição
- Nome completo
- Email
- WhatsApp
- Número da OAB
- Temas de interesse
- Duração preferida
- Autorização de contato
- Status do comprovante
- Aceite da LGPD

**Benefícios:**
- Controle em tempo real das inscrições
- Contagem automática de participantes
- Backup seguro dos dados
- Facilita organização do evento

## 🚀 Como Usar

### Para o Usuário Final:
1. Acesse o formulário de inscrição
2. Preencha os dados pessoais
3. **NOVO:** Arraste ou clique para enviar comprovante
4. **NOVO:** Veja o preview do arquivo enviado
5. Complete o formulário e envie

### Para o Organizador:
1. Configure o Google Sheets (veja instruções abaixo)
2. Acompanhe inscrições em tempo real na planilha
3. Receba emails com comprovantes anexados
4. Receba notificações via WhatsApp

## ⚙️ Configuração Necessária

### 1. Email (FormSubmit)
```javascript
const EMAIL_DESTINO = 'seu@email.com';
```

### 2. WhatsApp
```javascript
const WHATSAPP_NUMERO = '5511999999999';
```

### 3. Google Sheets
```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/SEU_ID/exec';
```

**📖 Instruções detalhadas:** Veja o arquivo `INSTRUCOES_GOOGLE_SHEETS.md`

## 📁 Arquivos do Projeto

- `index.html` - Página principal com formulário atualizado
- `script.js` - JavaScript com preview e integração
- `styles.css` - CSS com estilos para preview
- `INSTRUCOES_GOOGLE_SHEETS.md` - Guia completo do Google Sheets
- `README.md` - Este arquivo

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos e responsivos
- **JavaScript ES6+** - Funcionalidades interativas
- **FileReader API** - Preview de imagens
- **Fetch API** - Integração com Google Sheets
- **FormSubmit** - Envio de emails gratuito
- **Google Apps Script** - Backend para planilha

## 📱 Recursos Visuais

### Preview de Imagens
- Miniatura responsiva
- Informações do arquivo
- Botão de remoção estilizado
- Loading state animado

### Preview de PDFs
- Ícone representativo
- Informações do documento
- Confirmação visual de upload

### Estados de Erro
- Mensagens claras de erro
- Validação de tamanho e formato
- Feedback visual imediato

## 🎯 Benefícios das Melhorias

### Para Usuários:
- **Experiência melhorada** com preview visual
- **Confiança** ao ver o arquivo carregado
- **Facilidade** no drag & drop
- **Feedback** imediato sobre erros

### Para Organizadores:
- **Controle total** das inscrições
- **Dados organizados** automaticamente
- **Backup seguro** na nuvem
- **Relatórios** em tempo real

## 🔒 Segurança e Privacidade

- Dados salvos apenas com consentimento (LGPD)
- Planilha privada (apenas organizador tem acesso)
- Comunicação segura via HTTPS
- Validação de arquivos no frontend

## 📊 Monitoramento

### Console do Navegador
O sistema exibe logs informativos:
- ✅ Sucesso no envio para planilha
- ⚠️ Avisos de configuração
- ❌ Erros detalhados

### Google Sheets
- Dados aparecem automaticamente
- Timestamp de cada inscrição
- Possibilidade de criar gráficos

## 🆘 Suporte

Em caso de problemas:
1. Verifique as configurações no `script.js`
2. Consulte o console do navegador (F12)
3. Teste a configuração do Google Sheets
4. Verifique se o FormSubmit foi confirmado

---

**🎉 Sistema pronto para uso!** Todas as melhorias solicitadas foram implementadas com sucesso.
