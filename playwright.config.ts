import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Tempo máximo de execução por teste */
  timeout: 60 * 1000,
  
  /* Configurações de expect */
  expect: {
    timeout: 10000
  },
  
  /* Executar testes em paralelo */
  fullyParallel: false,
  
  /* Falhar build se houver testes marcados como only */
  forbidOnly: !!process.env.CI,
  
  /* Número de tentativas em caso de falha */
  retries: process.env.CI ? 2 : 0,
  
  /* Número de workers */
  workers: process.env.CI ? 1 : 1,
  
  /* Reporter */
  reporter: [
    ['html'],
    ['list']
  ],
  
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegações */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    /* Coletar trace em caso de falha */
    trace: 'on-first-retry',
    
    /* Screenshot em caso de falha */
    screenshot: 'only-on-failure',
    
    /* Vídeo em caso de falha */
    video: 'retain-on-failure',
    
    /* Timeout para ações */
    actionTimeout: 15000,
    
    /* Timeout para navegação */
    navigationTimeout: 30000,
  },

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Servidor de desenvolvimento (opcional) */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
