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

  test('el nombre de arriba lleva al inicio desde cualquier página', async ({ page }) => {
    for (const ruta of ['/transporte/', '/servicios/', '/privacidad.html']) {
      await page.goto(ruta);
      await page.getByRole('banner').getByRole('link', { name: 'Diego Moreno Bernal' }).click();
      await expect(page).toHaveURL('/');
    }
  });

  test('las 3 tarjetas del inicio llevan a cada sección', async ({ page }) => {
    const tarjetas: [string, string][] = [
      ['Salud para tu equipo', '/emermedica/'],
      ['Oficina en orden y empresa en regla', '/servicios/'],
      ['Vacaciones', '/viajes/'],
    ];
    for (const [nombre, ruta] of tarjetas) {
      await page.goto('/');
      await page.getByRole('main').getByRole('link', { name: new RegExp(nombre) }).click();
      await expect(page).toHaveURL(ruta);
    }
  });

  test('desde Servicios DM se llega a la página de transporte', async ({ page }) => {
    await page.goto('/servicios/');
    await page.getByRole('link', { name: /Vea cómo le ayudamos/ }).click();
    await expect(page).toHaveURL('/transporte/');
  });
});

test.describe('Sin portafolio ni hoja de vida', () => {
  test('la dirección vieja del portafolio lleva a Servicios DM', async ({ page }) => {
    await page.goto('/portafolio/');
    await expect(page).toHaveURL('/servicios/');
  });
});
