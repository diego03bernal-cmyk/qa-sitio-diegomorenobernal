import { test, expect } from '@playwright/test';
import { TODAS } from '../sitio';

test('ningún enlace interno está roto', async ({ page, request, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'escritorio', 'Basta con revisarlo una vez');

  const origen = new URL(baseURL!).origin;
  const encontrados = new Map<string, string>(); // enlace -> página donde aparece

  for (const pagina of TODAS) {
    await page.goto(pagina.ruta);
    const hrefs = await page.locator('a[href]').evaluateAll(as => as.map(a => (a as HTMLAnchorElement).href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin === origen && !encontrados.has(url.pathname)) encontrados.set(url.pathname, pagina.ruta);
    }
  }

  expect(encontrados.size).toBeGreaterThan(5);
  for (const [ruta, desde] of encontrados) {
    const respuesta = await request.get(ruta);
    expect.soft(respuesta.status(), `${ruta} (enlazado desde ${desde})`).toBeLessThan(400);
  }
});

test('la vista previa vieja ya no existe', async ({ request }) => {
  test.skip(!!process.env.BASE_URL, 'Solo contra el sitio publicado');
  expect((await request.get('/vista/transporte/')).status()).toBe(404);
});
