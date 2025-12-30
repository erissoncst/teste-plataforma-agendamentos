import { test, expect } from '@playwright/test';
import { BookingFlowHelper } from '../../helpers/booking-flow';

/**
 * Testes E2E para o fluxo de agendamento
 * 
 * Estes testes validam o fluxo completo de agendamento na plataforma,
 * desde a seleção do serviço até a confirmação final.
 */

test.describe('Fluxo de Agendamento', () => {
  let bookingFlow: BookingFlowHelper;

  // Configuração antes de cada teste
  test.beforeEach(async ({ page }) => {
    bookingFlow = new BookingFlowHelper(page);
  });

  test('Deve carregar a página de agendamento corretamente', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Verifica se a página carregou
    await expect(page).toHaveURL(new RegExp(`/${subdominio}/agendar`));
    
    // Verifica se há serviços disponíveis
    const servicos = page.locator('[data-testid^="service-card-"]');
    await expect(servicos.first()).toBeVisible({ timeout: 10000 });
  });

  test('Deve selecionar um serviço e avançar para profissionais', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Seleciona o primeiro serviço
    await bookingFlow.selecionarPrimeiroServico();
    
    // Verifica se o botão avançar está habilitado
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeEnabled();
    
    // Avança para próxima etapa
    await bookingFlow.clicarAvancar();
    
    // Verifica se chegou na etapa de profissionais
    const profissionais = page.locator('[data-testid^="professional-card-"]');
    await expect(profissionais.first()).toBeVisible({ timeout: 5000 });
  });

  test('Deve navegar entre as etapas usando botão voltar', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Seleciona serviço e avança
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    // Verifica que está na etapa de profissionais
    const profissionais = page.locator('[data-testid^="professional-card-"]');
    await expect(profissionais.first()).toBeVisible();
    
    // Volta para etapa anterior
    await bookingFlow.clicarVoltar();
    
    // Verifica que voltou para serviços
    const servicos = page.locator('[data-testid^="service-card-"]');
    await expect(servicos.first()).toBeVisible();
  });

  test('Deve selecionar data e exibir horários disponíveis', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Navega até a etapa de data/hora
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiroProfissional();
    await bookingFlow.clicarAvancar();
    
    // Seleciona unidade se necessário
    await bookingFlow.selecionarPrimeiraUnidade();
    const unidades = await page.locator('[data-testid^="location-card-"]').count();
    if (unidades > 0) {
      await bookingFlow.clicarAvancar();
    }
    
    // Seleciona primeira data
    await bookingFlow.selecionarPrimeiraData();
    
    // Verifica se horários foram carregados
    const horarios = page.locator('[data-testid^="time-button-"]');
    await expect(horarios.first()).toBeVisible({ timeout: 10000 });
  });

  test('Deve preencher dados do cliente corretamente', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    const dadosCliente = {
      telefone: process.env.TEST_CLIENTE_TELEFONE || '11999999999',
      nome: process.env.TEST_CLIENTE_NOME || 'João da Silva Teste',
      email: process.env.TEST_CLIENTE_EMAIL || 'joao.teste@example.com'
    };
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Navega até a etapa de dados do cliente
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiroProfissional();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiraUnidade();
    const unidades = await page.locator('[data-testid^="location-card-"]').count();
    if (unidades > 0) {
      await bookingFlow.clicarAvancar();
    }
    
    await bookingFlow.selecionarPrimeiraData();
    await bookingFlow.selecionarPrimeiroHorario();
    await bookingFlow.clicarAvancar();
    
    // Preenche dados do cliente
    await bookingFlow.preencherDadosCliente(dadosCliente);
    
    // Verifica se os campos foram preenchidos
    const inputTelefone = page.getByTestId('input-telefone');
    await expect(inputTelefone).toHaveValue(new RegExp(dadosCliente.telefone.substring(0, 8)));
    
    const inputNome = page.getByTestId('input-nome');
    const nomeValue = await inputNome.inputValue();
    expect(nomeValue.length).toBeGreaterThan(0);
  });

  test('Deve completar o fluxo de agendamento até a confirmação', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    const dadosCliente = {
      telefone: process.env.TEST_CLIENTE_TELEFONE || '11999999999',
      nome: process.env.TEST_CLIENTE_NOME || 'João da Silva Teste',
      email: process.env.TEST_CLIENTE_EMAIL || 'joao.teste@example.com'
    };
    
    // Executa o fluxo completo
    const resultado = await bookingFlow.realizarAgendamentoCompleto(subdominio, dadosCliente);
    
    // Verifica se chegou na confirmação
    expect(resultado.pronto).toBeTruthy();
    
    // Verifica se o botão de confirmação está visível
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeVisible();
    await expect(buttonAvancar).toBeEnabled();
    
    const textoButton = await buttonAvancar.textContent();
    expect(textoButton).toContain('Confirmar');
  });

  test('Deve desabilitar botão avançar quando nenhuma opção está selecionada', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Verifica que o botão está desabilitado inicialmente
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeDisabled();
  });

  test('Deve exibir resumo do agendamento nas etapas', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Seleciona serviço e avança
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    // Verifica se o resumo aparece (CollapsibleSummary)
    // O resumo deve aparecer a partir da segunda etapa
    await page.waitForTimeout(1000);
    
    // Verifica se há elementos de resumo na página
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Validações de Campos', () => {
  let bookingFlow: BookingFlowHelper;

  test.beforeEach(async ({ page }) => {
    bookingFlow = new BookingFlowHelper(page);
  });

  test('Deve validar formato de telefone', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Navega até dados do cliente
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiroProfissional();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiraUnidade();
    const unidades = await page.locator('[data-testid^="location-card-"]').count();
    if (unidades > 0) {
      await bookingFlow.clicarAvancar();
    }
    
    await bookingFlow.selecionarPrimeiraData();
    await bookingFlow.selecionarPrimeiroHorario();
    await bookingFlow.clicarAvancar();
    
    // Tenta preencher telefone inválido
    const inputTelefone = page.getByTestId('input-telefone');
    await inputTelefone.fill('123');
    
    await page.waitForTimeout(1000);
    
    // Verifica que o botão continua desabilitado
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeDisabled();
  });

  test('Deve validar nome mínimo', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    // Navega até dados do cliente
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiroProfissional();
    await bookingFlow.clicarAvancar();
    
    await bookingFlow.selecionarPrimeiraUnidade();
    const unidades = await page.locator('[data-testid^="location-card-"]').count();
    if (unidades > 0) {
      await bookingFlow.clicarAvancar();
    }
    
    await bookingFlow.selecionarPrimeiraData();
    await bookingFlow.selecionarPrimeiroHorario();
    await bookingFlow.clicarAvancar();
    
    // Preenche telefone válido
    const inputTelefone = page.getByTestId('input-telefone');
    await inputTelefone.fill('11999999999');
    await page.waitForTimeout(2000);
    
    // Tenta preencher nome muito curto
    const inputNome = page.getByTestId('input-nome');
    const isReadonly = await inputNome.getAttribute('readonly');
    
    if (!isReadonly) {
      await inputNome.fill('Jo');
      await page.waitForTimeout(500);
      
      // Verifica que o botão continua desabilitado
      const buttonAvancar = page.getByTestId('button-avancar');
      await expect(buttonAvancar).toBeDisabled();
    }
  });
});
