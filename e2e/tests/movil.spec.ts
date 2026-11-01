import { test, expect } from '@playwright/test';
import { MENU, PAGINAS_DEL_MENU, TODAS, menu } from '../sitio';

test.describe('En el celular', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'movil', 'Solo aplica al celular');
  });

  for (const pagina of TODAS) {
    test(`${pagina.ruta} no se sale de la pantalla hacia los lados`, async ({ page }) => {
      await page.goto(pagina.ruta);
      const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(desborde).toBeLessThanOrEqual(1);
    });
  }

  for (const pagina of PAGINAS_DEL_MENU) {
    test(`${pagina.ruta}: el botón Menú muestra todas las opciones`, async ({ page }) => {
      await page.goto(pagina.ruta);
      const boton = page.getByRole('button', { name: /Menú/ });
      await expect(boton).toHaveAttribute('aria-expanded', 'false');
      await expect(menu(page)).toBeHidden();

      await boton.tap();
      await expect(page.getByRole('button', { name: /Cerrar/ })).toHaveAttribute('aria-expanded', 'true');
      for (const opcion of MENU) {
        await expect(menu(page).getByRole('link', { name: new RegExp(`^${opcion}`) })).toBeInViewport();
      }

      await page.getByRole('button', { name: /Cerrar/ }).tap();
      await expect(menu(page)).toBeHidden();
    });
  }

  test('desde transporte se vuelve al inicio con el menú', async ({ page }) => {
    await page.goto('/transporte/');
    await page.getByRole('button', { name: /Menú/ }).tap();
    await menu(page).getByRole('link', { name: /^Inicio/ }).tap();
    await expect(page).toHaveURL('/');
  });
});
