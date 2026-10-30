import { test, expect } from '@playwright/test';
import { MENU, PAGINAS_DEL_MENU, abrirMenu, menu } from '../sitio';

test.describe('Menú común', () => {
  for (const pagina of PAGINAS_DEL_MENU) {
    test(`${pagina.ruta} muestra el menú completo y marca la sección actual @smoke`, async ({ page }) => {
      await page.goto(pagina.ruta);
      await expect(page).toHaveTitle(new RegExp(pagina.titulo));

      await abrirMenu(page);
      await expect(menu(page).getByRole('link')).toHaveText(MENU.map(m => new RegExp(`^${m}`)));
      await expect(menu(page).getByRole('link', { name: new RegExp(`^${pagina.menu}`) })).toHaveAttribute('aria-current', 'page');
      await expect(menu(page).locator('[aria-current="page"]')).toHaveCount(1);
    });
  }

  test('se recorre todo el sitio usando solo el menú', async ({ page }) => {
    await page.goto('/');
    for (const pagina of [...PAGINAS_DEL_MENU.slice(1), PAGINAS_DEL_MENU[0]]) {
      await test.step(`ir a ${pagina.menu}`, async () => {
        await abrirMenu(page);
        await menu(page).getByRole('link', { name: new RegExp(`^${pagina.menu}`) }).click();
        await expect(page).toHaveURL(pagina.ruta);
        await abrirMenu(page); // en el celular la página nueva abre con el menú cerrado
        await expect(menu(page).getByRole('link', { name: new RegExp(`^${pagina.menu}`) })).toHaveAttribute('aria-current', 'page');
      });
    }
  });

  test('el nombre de arriba lleva al inicio, también desde el portafolio', async ({ page }) => {
    for (const ruta of ['/transporte/', '/portafolio/', '/privacidad.html']) {
      await page.goto(ruta);
      await page.getByRole('banner').getByRole('link', { name: 'Diego Moreno Bernal' }).click();
      await expect(page).toHaveURL('/');
    }
  });

  test('las 4 tarjetas del inicio llevan a cada sección', async ({ page }) => {
    const tarjetas: [string, string][] = [
      ['Salud para tu equipo', '/emermedica/'],
      ['Oficina en orden con IA', '/servicios/'],
      ['Para empresas de transporte', '/transporte/'],
      ['Vacaciones', '/viajes/'],
    ];
    await page.goto('/');
    await expect(page.getByRole('main').getByRole('link')).toHaveCount(tarjetas.length);
    for (const [nombre, ruta] of tarjetas) {
      await page.goto('/');
      await page.getByRole('main').getByRole('link', { name: new RegExp(nombre) }).click();
      await expect(page).toHaveURL(ruta);
    }
  });
});

test.describe('Portafolio', () => {
  test('la hoja de vida abre en la misma pestaña y el PDF existe', async ({ page, request }) => {
    await page.goto('/portafolio/');
    const enlaces = page.locator('a[href="/hoja-de-vida.pdf"]');
    await expect(enlaces.first()).toBeVisible();
    // Abrir en pestaña nueva rompe el botón "atrás", sobre todo en el celular.
    for (const enlace of await enlaces.all()) {
      await expect(enlace).not.toHaveAttribute('target', '_blank');
    }

    const pdf = await request.get('/hoja-de-vida.pdf');
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
  });
});
