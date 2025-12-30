# Testes E2E - Plataforma de Agendamentos

Projeto de testes End-to-End (E2E) utilizando **Playwright** para validar o fluxo de agendamento da plataforma charm-booking-flow.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando os Testes](#executando-os-testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fluxo de Agendamento](#fluxo-de-agendamento)
- [Helper de Navegação](#helper-de-navegação)
- [Contribuindo](#contribuindo)

## 🎯 Sobre o Projeto

Este projeto contém testes automatizados E2E para validar o fluxo completo de agendamento na plataforma. Os testes cobrem todas as etapas do processo, desde a seleção do serviço até a confirmação final do agendamento.

## 🚀 Tecnologias

- **[Playwright](https://playwright.dev/)** - Framework de testes E2E
- **TypeScript** - Linguagem de programação
- **Node.js** - Ambiente de execução

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Git**

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/erissoncst/teste-plataforma-agendamentos.git
cd teste-plataforma-agendamentos
```

2. Instale as dependências:

```bash
npm install
```

3. Instale os navegadores do Playwright:

```bash
npx playwright install chromium
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:

```env
# URL base da aplicação
BASE_URL=http://localhost:5173

# Subdomínio para testes
TEST_SUBDOMINIO=demo

# Dados de teste
TEST_CLIENTE_NOME=João da Silva
TEST_CLIENTE_TELEFONE=11999999999
TEST_CLIENTE_EMAIL=joao.silva@example.com
```

## 🧪 Executando os Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes em modo headed (com interface gráfica)

```bash
npm run test:headed
```

### Executar testes em modo debug

```bash
npm run test:debug
```

### Executar testes com interface UI do Playwright

```bash
npm run test:ui
```

### Executar apenas os testes de agendamento

```bash
npm run test:agendamento
```

### Visualizar relatório de testes

```bash
npm run test:report
```

## 📁 Estrutura do Projeto

```
teste-plataforma-agendamentos/
├── helpers/
│   └── booking-flow.ts          # Helper para navegação no fluxo
├── tests/
│   └── e2e/
│       └── agendamento.spec.ts  # Testes do fluxo de agendamento
├── fixtures/                     # Dados de teste (fixtures)
├── playwright.config.ts          # Configuração do Playwright
├── tsconfig.json                 # Configuração do TypeScript
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
├── package.json                  # Dependências e scripts
└── README.md                     # Documentação
```

## 🔄 Fluxo de Agendamento

O fluxo de agendamento testado consiste nas seguintes etapas:

1. **Seleção de Serviço** - Escolha do serviço desejado
2. **Seleção de Profissional** - Escolha do profissional
3. **Seleção de Unidade** - Escolha da unidade (se houver mais de uma)
4. **Seleção de Data** - Escolha da data do agendamento
5. **Seleção de Horário** - Escolha do horário disponível
6. **Dados do Cliente** - Preenchimento de telefone, nome e email
7. **Confirmação** - Confirmação final do agendamento

## 🛠️ Helper de Navegação

O projeto inclui um helper (`BookingFlowHelper`) que facilita a navegação pelo fluxo de agendamento. Principais métodos:

### Navegação

- `navegarParaAgendamento(subdominio)` - Navega para a página de agendamento
- `clicarAvancar()` - Clica no botão "Avançar"
- `clicarVoltar()` - Clica no botão "Voltar"

### Seleção de Elementos

- `selecionarServico(servicoId)` - Seleciona um serviço específico
- `selecionarPrimeiroServico()` - Seleciona o primeiro serviço disponível
- `selecionarProfissional(profissionalId)` - Seleciona um profissional específico
- `selecionarPrimeiroProfissional()` - Seleciona o primeiro profissional disponível
- `selecionarUnidade(unidadeId)` - Seleciona uma unidade específica
- `selecionarPrimeiraUnidade()` - Seleciona a primeira unidade disponível
- `selecionarData(data)` - Seleciona uma data específica
- `selecionarPrimeiraData()` - Seleciona a primeira data disponível
- `selecionarHorario(horario)` - Seleciona um horário específico
- `selecionarPrimeiroHorario()` - Seleciona o primeiro horário disponível

### Preenchimento de Formulário

- `preencherDadosCliente(dados)` - Preenche os dados do cliente (telefone, nome, email)

### Fluxo Completo

- `realizarAgendamentoCompleto(subdominio, dadosCliente)` - Executa o fluxo completo de agendamento

### Exemplo de Uso

```typescript
import { test } from '@playwright/test';
import { BookingFlowHelper } from '../helpers/booking-flow';

test('Teste de agendamento', async ({ page }) => {
  const bookingFlow = new BookingFlowHelper(page);
  
  await bookingFlow.realizarAgendamentoCompleto('demo', {
    telefone: '11999999999',
    nome: 'João da Silva',
    email: 'joao@example.com'
  });
});
```

## 📝 Testes Implementados

### Fluxo de Agendamento

- ✅ Carregamento da página de agendamento
- ✅ Seleção de serviço e navegação para profissionais
- ✅ Navegação entre etapas usando botão voltar
- ✅ Seleção de data e exibição de horários
- ✅ Preenchimento de dados do cliente
- ✅ Fluxo completo até a confirmação
- ✅ Validação de botão desabilitado sem seleção
- ✅ Exibição de resumo do agendamento

### Validações de Campos

- ✅ Validação de formato de telefone
- ✅ Validação de nome mínimo

## 🎨 Data Test IDs Implementados

Os seguintes `data-testid` foram adicionados aos componentes do charm-booking-flow:

### ServiceCard
- `service-card-{servicoId}` - Card de serviço

### ProfessionalCard
- `professional-card-{profissionalId}` - Card de profissional

### LocationCard
- `location-card-{unidadeId}` - Card de unidade

### DateTimeSelector
- `date-button-{data}` - Botão de data (formato YYYY-MM-DD)
- `time-button-{horario}` - Botão de horário (formato HH:MM)

### IdentificationForm
- `input-telefone` - Campo de telefone
- `input-nome` - Campo de nome
- `input-email` - Campo de email

### StickyFooter
- `button-voltar` - Botão "Voltar"
- `button-avancar` - Botão "Avançar" / "Confirmar"

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👥 Autores

- **Erisson** - [erissoncst](https://github.com/erissoncst)

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do GitHub.

---

Desenvolvido com ❤️ usando Playwright
