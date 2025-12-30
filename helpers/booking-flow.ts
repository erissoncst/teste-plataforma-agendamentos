import { Page, expect } from '@playwright/test';

/**
 * Helper class para navegar pelo fluxo de agendamento
 */
export class BookingFlowHelper {
  constructor(private page: Page) {}

  /**
   * Navega para a página de agendamento
   * @param subdominio - Subdomínio do parceiro
   */
  async navegarParaAgendamento(subdominio: string) {
    await this.page.goto(`/${subdominio}/agendar`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Seleciona um serviço pelo ID
   * @param servicoId - ID do serviço
   */
  async selecionarServico(servicoId: string) {
    const servicoCard = this.page.getByTestId(`service-card-${servicoId}`);
    await expect(servicoCard).toBeVisible();
    await servicoCard.click();
    await this.page.waitForTimeout(500); // Aguarda animação
  }

  /**
   * Seleciona o primeiro serviço disponível
   */
  async selecionarPrimeiroServico() {
    const primeiroServico = this.page.locator('[data-testid^="service-card-"]').first();
    await expect(primeiroServico).toBeVisible();
    const servicoId = await primeiroServico.getAttribute('data-testid');
    await primeiroServico.click();
    await this.page.waitForTimeout(500);
    return servicoId?.replace('service-card-', '');
  }

  /**
   * Seleciona um profissional pelo ID
   * @param profissionalId - ID do profissional
   */
  async selecionarProfissional(profissionalId: string) {
    const profissionalCard = this.page.getByTestId(`professional-card-${profissionalId}`);
    await expect(profissionalCard).toBeVisible();
    await profissionalCard.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Seleciona o primeiro profissional disponível
   */
  async selecionarPrimeiroProfissional() {
    const primeiroProfissional = this.page.locator('[data-testid^="professional-card-"]').first();
    await expect(primeiroProfissional).toBeVisible();
    const profissionalId = await primeiroProfissional.getAttribute('data-testid');
    await primeiroProfissional.click();
    await this.page.waitForTimeout(500);
    return profissionalId?.replace('professional-card-', '');
  }

  /**
   * Seleciona uma unidade pelo ID
   * @param unidadeId - ID da unidade
   */
  async selecionarUnidade(unidadeId: string) {
    const unidadeCard = this.page.getByTestId(`location-card-${unidadeId}`);
    await expect(unidadeCard).toBeVisible();
    await unidadeCard.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Seleciona a primeira unidade disponível (se houver mais de uma)
   */
  async selecionarPrimeiraUnidade() {
    const primeiraUnidade = this.page.locator('[data-testid^="location-card-"]').first();
    
    // Verifica se existe unidade para selecionar
    const count = await this.page.locator('[data-testid^="location-card-"]').count();
    if (count === 0) {
      console.log('Nenhuma unidade para selecionar - provavelmente há apenas uma unidade');
      return null;
    }

    await expect(primeiraUnidade).toBeVisible();
    const unidadeId = await primeiraUnidade.getAttribute('data-testid');
    await primeiraUnidade.click();
    await this.page.waitForTimeout(500);
    return unidadeId?.replace('location-card-', '');
  }

  /**
   * Seleciona uma data específica
   * @param data - Data no formato YYYY-MM-DD
   */
  async selecionarData(data: string) {
    const dataButton = this.page.getByTestId(`date-button-${data}`);
    await expect(dataButton).toBeVisible();
    await dataButton.click();
    await this.page.waitForTimeout(1000); // Aguarda carregamento de horários
  }

  /**
   * Seleciona a primeira data disponível (hoje)
   */
  async selecionarPrimeiraData() {
    const primeiraData = this.page.locator('[data-testid^="date-button-"]').first();
    await expect(primeiraData).toBeVisible();
    const dataId = await primeiraData.getAttribute('data-testid');
    await primeiraData.click();
    await this.page.waitForTimeout(1000);
    return dataId?.replace('date-button-', '');
  }

  /**
   * Seleciona um horário específico
   * @param horario - Horário no formato HH:MM
   */
  async selecionarHorario(horario: string) {
    const horarioButton = this.page.getByTestId(`time-button-${horario}`);
    await expect(horarioButton).toBeVisible();
    await horarioButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Seleciona o primeiro horário disponível
   */
  async selecionarPrimeiroHorario() {
    // Aguarda horários carregarem
    await this.page.waitForSelector('[data-testid^="time-button-"]', { timeout: 10000 });
    
    const primeiroHorario = this.page.locator('[data-testid^="time-button-"]').first();
    await expect(primeiroHorario).toBeVisible();
    const horarioId = await primeiroHorario.getAttribute('data-testid');
    await primeiroHorario.click();
    await this.page.waitForTimeout(500);
    return horarioId?.replace('time-button-', '');
  }

  /**
   * Preenche os dados de identificação do cliente
   * @param dados - Dados do cliente (telefone, nome, email)
   */
  async preencherDadosCliente(dados: { telefone: string; nome: string; email?: string }) {
    // Preencher telefone
    const inputTelefone = this.page.getByTestId('input-telefone');
    await expect(inputTelefone).toBeVisible();
    await inputTelefone.fill(dados.telefone);
    
    // Aguardar busca do cliente
    await this.page.waitForTimeout(2000);

    // Preencher nome (se não estiver readonly)
    const inputNome = this.page.getByTestId('input-nome');
    await expect(inputNome).toBeVisible();
    
    const isReadonly = await inputNome.getAttribute('readonly');
    if (!isReadonly) {
      await inputNome.fill(dados.nome);
    }

    // Preencher email (opcional)
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

  /**
   * Clica no botão "Avançar"
   */
  async clicarAvancar() {
    const buttonAvancar = this.page.getByTestId('button-avancar');
    await expect(buttonAvancar).toBeVisible();
    await expect(buttonAvancar).toBeEnabled();
    await buttonAvancar.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Clica no botão "Voltar"
   */
  async clicarVoltar() {
    const buttonVoltar = this.page.getByTestId('button-voltar');
    await expect(buttonVoltar).toBeVisible();
    await buttonVoltar.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verifica se está na etapa de confirmação final
   */
  async verificarBotaoConfirmar() {
    const buttonAvancar = this.page.getByTestId('button-avancar');
    const texto = await buttonAvancar.textContent();
    return texto?.includes('Confirmar');
  }

  /**
   * Fluxo completo de agendamento
   * @param subdominio - Subdomínio do parceiro
   * @param dadosCliente - Dados do cliente
   */
  async realizarAgendamentoCompleto(
    subdominio: string,
    dadosCliente: { telefone: string; nome: string; email?: string }
  ) {
    // 1. Navegar para página de agendamento
    await this.navegarParaAgendamento(subdominio);

    // 2. Selecionar serviço
    await this.selecionarPrimeiroServico();
    await this.clicarAvancar();

    // 3. Selecionar profissional
    await this.selecionarPrimeiroProfissional();
    await this.clicarAvancar();

    // 4. Selecionar unidade (se necessário)
    const unidadeSelecionada = await this.selecionarPrimeiraUnidade();
    if (unidadeSelecionada) {
      await this.clicarAvancar();
    }

    // 5. Selecionar data
    await this.selecionarPrimeiraData();
    
    // 6. Selecionar horário
    await this.selecionarPrimeiroHorario();
    await this.clicarAvancar();

    // 7. Preencher dados do cliente
    await this.preencherDadosCliente(dadosCliente);
    
    // 8. Verificar se chegou na confirmação
    const isConfirmacao = await this.verificarBotaoConfirmar();
    expect(isConfirmacao).toBeTruthy();

    return {
      pronto: true,
      mensagem: 'Fluxo completo executado com sucesso'
    };
  }
}
