import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e/tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 2, // la conexión al servidor a veces se corta; un fallo real falla las 3 veces
  workers: 2,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    // Se puede apuntar a otra copia del sitio: BASE_URL=https://... npm test
    baseURL: process.env.BASE_URL ?? 'https://diegomorenobernal.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
  },
  projects: [
    // Usa el Chrome ya instalado en el equipo: no hace falta descargar navegadores.
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
