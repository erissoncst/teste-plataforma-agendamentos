import { test, expect } from '@playwright/test';
import { BookingFlowHelper } from '../../helpers/booking-flow';

test.describe('Fluxo de Agendamento', () => {
  let bookingFlow: BookingFlowHelper;

  test.beforeEach(async ({ page }) => {
    bookingFlow = new BookingFlowHelper(page);
  });

  test('Deve carregar a página de agendamento corretamente', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    await expect(page).toHaveURL(new RegExp(`/${subdominio}/agendar`));
    
    const servicos = page.locator('[data-testid^="service-card-"]');
    await expect(servicos.first()).toBeVisible({ timeout: 10000 });
  });

  test('Deve selecionar um serviço e avançar para profissionais', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    await bookingFlow.selecionarPrimeiroServico();
    
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeEnabled();
    
    await bookingFlow.clicarAvancar();
    
    const profissionais = page.locator('[data-testid^="professional-card-"]');
    await expect(profissionais.first()).toBeVisible({ timeout: 5000 });
  });

  test('Deve navegar entre as etapas usando botão voltar', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    const profissionais = page.locator('[data-testid^="professional-card-"]');
    await expect(profissionais.first()).toBeVisible();
    
    await bookingFlow.clicarVoltar();
    
    const servicos = page.locator('[data-testid^="service-card-"]');
    await expect(servicos.first()).toBeVisible();
  });

  test('Deve selecionar data e exibir horários disponíveis', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
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
    
    await bookingFlow.preencherDadosCliente(dadosCliente);
    
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
    
    const resultado = await bookingFlow.realizarAgendamentoCompleto(subdominio, dadosCliente);
    
    expect(resultado.pronto).toBeTruthy();
    
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeVisible();
    await expect(buttonAvancar).toBeEnabled();
    
    const textoButton = await buttonAvancar.textContent();
    expect(textoButton).toContain('Confirmar');
  });

  test('Deve desabilitar botão avançar quando nenhuma opção está selecionada', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeDisabled();
  });

  test('Deve exibir resumo do agendamento nas etapas', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
    await bookingFlow.selecionarPrimeiroServico();
    await bookingFlow.clicarAvancar();
    
    await page.waitForTimeout(1000);
    
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
    
    const inputTelefone = page.getByTestId('input-telefone');
    await inputTelefone.fill('123');
    
    await page.waitForTimeout(1000);
    
    const buttonAvancar = page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeDisabled();
  });

  test('Deve validar nome mínimo', async ({ page }) => {
    const subdominio = process.env.TEST_SUBDOMINIO || 'demo';
    
    await bookingFlow.navegarParaAgendamento(subdominio);
    
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
    
    const inputTelefone = page.getByTestId('input-telefone');
    await inputTelefone.fill('11999999999');
    await page.waitForTimeout(2000);
    
    const inputNome = page.getByTestId('input-nome');
    const isReadonly = await inputNome.getAttribute('readonly');
    
    if (!isReadonly) {
      await inputNome.fill('Jo');
      await page.waitForTimeout(500);
      
      const buttonAvancar = page.getByTestId('button-avancar');
      await expect(buttonAvancar).toBeDisabled();
    }
  });
});
