import { Page, expect } from '@playwright/test';

export class BookingFlowHelper {
  constructor(private page: Page) {}

  async navegarParaAgendamento(subdominio: string) {
    await this.page.goto(`/${subdominio}/agendar`);
    await this.page.waitForLoadState('networkidle');
  }

  async selecionarServico(servicoId: string) {
    const servicoCard = this.page.getByTestId(`service-card-${servicoId}`);
    await expect(servicoCard).toBeVisible();
    await servicoCard.click();
    await this.page.waitForTimeout(500);
  }

  async selecionarPrimeiroServico() {
    const primeiroServico = this.page.locator('[data-testid^="service-card-"]').first();
    await expect(primeiroServico).toBeVisible();
    const servicoId = await primeiroServico.getAttribute('data-testid');
    await primeiroServico.click();
    await this.page.waitForTimeout(500);
    return servicoId?.replace('service-card-', '');
  }

  async selecionarProfissional(profissionalId: string) {
    const profissionalCard = this.page.getByTestId(`professional-card-${profissionalId}`);
    await expect(profissionalCard).toBeVisible();
    await profissionalCard.click();
    await this.page.waitForTimeout(500);
  }

  async selecionarPrimeiroProfissional() {
    const primeiroProfissional = this.page.locator('[data-testid^="professional-card-"]').first();
    await expect(primeiroProfissional).toBeVisible();
    const profissionalId = await primeiroProfissional.getAttribute('data-testid');
    await primeiroProfissional.click();
    await this.page.waitForTimeout(500);
    return profissionalId?.replace('professional-card-', '');
  }

  async selecionarUnidade(unidadeId: string) {
    const unidadeCard = this.page.getByTestId(`location-card-${unidadeId}`);
    await expect(unidadeCard).toBeVisible();
    await unidadeCard.click();
    await this.page.waitForTimeout(500);
  }

  async selecionarPrimeiraUnidade() {
    const primeiraUnidade = this.page.locator('[data-testid^="location-card-"]').first();
    
    const count = await this.page.locator('[data-testid^="location-card-"]').count();
    if (count === 0) {
      return null;
    }

    await expect(primeiraUnidade).toBeVisible();
    const unidadeId = await primeiraUnidade.getAttribute('data-testid');
    await primeiraUnidade.click();
    await this.page.waitForTimeout(500);
    return unidadeId?.replace('location-card-', '');
  }

  async selecionarData(data: string) {
    const dataButton = this.page.getByTestId(`date-button-${data}`);
    await expect(dataButton).toBeVisible();
    await dataButton.click();
    await this.page.waitForTimeout(1000);
  }

  async selecionarPrimeiraData() {
    const primeiraData = this.page.locator('[data-testid^="date-button-"]').first();
    await expect(primeiraData).toBeVisible();
    const dataId = await primeiraData.getAttribute('data-testid');
    await primeiraData.click();
    await this.page.waitForTimeout(1000);
    return dataId?.replace('date-button-', '');
  }

  async selecionarHorario(horario: string) {
    const horarioButton = this.page.getByTestId(`time-button-${horario}`);
    await expect(horarioButton).toBeVisible();
    await horarioButton.click();
    await this.page.waitForTimeout(500);
  }

  async selecionarPrimeiroHorario() {
    await this.page.waitForSelector('[data-testid^="time-button-"]', { timeout: 10000 });
    
    const primeiroHorario = this.page.locator('[data-testid^="time-button-"]').first();
    await expect(primeiroHorario).toBeVisible();
    const horarioId = await primeiroHorario.getAttribute('data-testid');
    await primeiroHorario.click();
    await this.page.waitForTimeout(500);
    return horarioId?.replace('time-button-', '');
  }

  async preencherDadosCliente(dados: { telefone: string; nome: string; email?: string }) {
    const inputTelefone = this.page.getByTestId('input-telefone');
    await expect(inputTelefone).toBeVisible();
    await inputTelefone.fill(dados.telefone);
    
    await this.page.waitForTimeout(2000);

    const inputNome = this.page.getByTestId('input-nome');
    await expect(inputNome).toBeVisible();
    
    const isReadonly = await inputNome.getAttribute('readonly');
    if (!isReadonly) {
      await inputNome.fill(dados.nome);
    }

    if (dados.email) {
      const inputEmail = this.page.getByTestId('input-email');
      await expect(inputEmail).toBeVisible();
      
      const isEmailReadonly = await inputEmail.getAttribute('readonly');
      if (!isEmailReadonly) {
        await inputEmail.fill(dados.email);
      }
    }

    await this.page.waitForTimeout(500);
  }

  async clicarAvancar() {
    const buttonAvancar = this.page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeVisible();
    await expect(buttonAvancar).toBeEnabled();
    await buttonAvancar.click();
    await this.page.waitForTimeout(1000);
  }

  async clicarVoltar() {
    const buttonVoltar = this.page.getByTestId('button-voltar');
    await expect(buttonVoltar).toBeVisible();
    await buttonVoltar.click();
    await this.page.waitForTimeout(500);
  }

  async verificarBotaoConfirmar() {
    const buttonAvancar = this.page.getByTestId('button-avancar');
    const texto = await buttonAvancar.textContent();
    return texto?.includes('Confirmar');
  }

  async realizarAgendamentoCompleto(
    subdominio: string,
    dadosCliente: { telefone: string; nome: string; email?: string }
  ) {
    await this.navegarParaAgendamento(subdominio);

    await this.selecionarPrimeiroServico();
    await this.clicarAvancar();

    await this.selecionarPrimeiroProfissional();
    await this.clicarAvancar();

    const unidadeSelecionada = await this.selecionarPrimeiraUnidade();
    if (unidadeSelecionada) {
      await this.clicarAvancar();
    }

    await this.selecionarPrimeiraData();
    
    await this.selecionarPrimeiroHorario();
    await this.clicarAvancar();

    await this.preencherDadosCliente(dadosCliente);
    
    const isConfirmacao = await this.verificarBotaoConfirmar();
    expect(isConfirmacao).toBeTruthy();

    return {
      pronto: true,
      mensagem: 'Fluxo completo executado com sucesso'
    };
  }
}
