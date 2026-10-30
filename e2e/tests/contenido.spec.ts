import { test, expect } from '@playwright/test';
import { FRASES_PROHIBIDAS, PRECIO_SIN_COP, TODAS, WHATSAPP } from '../sitio';

test.describe('Reglas de contenido', () => {
  for (const pagina of TODAS) {
    test(`${pagina.ruta} no tiene frases prohibidas y sus precios dicen COP`, async ({ page }) => {
      await page.goto(pagina.ruta);
      const texto = await page.locator('body').innerText();
      for (const frase of FRASES_PROHIBIDAS) {
        expect.soft(texto, `frase prohibida ${frase}`).not.toMatch(frase);
      }
      expect.soft(texto.match(PRECIO_SIN_COP)?.[0], 'precio sin COP').toBeUndefined();
    });

    test(`${pagina.ruta}: hay botón de WhatsApp a la vista y todos van al asistente`, async ({ page }) => {
      await page.goto(pagina.ruta);
      // El botón flotante queda a la vista sin bajar por la página.
      // El botón flotante es el último enlace de WhatsApp de la página.
      await expect(page.getByRole('link', { name: /WhatsApp/ }).last()).toBeInViewport();

      const enlaces = page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]');
      for (const href of await enlaces.evaluateAll(as => as.map(a => a.getAttribute('href') ?? ''))) {
        expect.soft(href, 'número de WhatsApp').toMatch(new RegExp(`^${WHATSAPP}(\\?|$)`));
      }
    });

    test(`${pagina.ruta} carga sin errores de JavaScript`, async ({ page }) => {
      const errores: string[] = [];
      page.on('pageerror', e => errores.push(e.message));
      // Las fallas de descarga (fuentes externas, conexión) las cubre la prueba de enlaces; aquí solo errores del código.
      page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/i.test(m.text())) errores.push(m.text()); });
      await page.goto(pagina.ruta, { waitUntil: 'load' });
      expect(errores).toEqual([]);
    });
  }

  test('Emermédica y On Vacation no se mezclan en la misma página', async ({ page }) => {
    await page.goto('/emermedica/');
    await expect(page.getByRole('main')).not.toContainText(/on vacation/i);

    await page.goto('/viajes/');
    await expect(page.getByRole('main')).not.toContainText(/emerm[eé]dica/i);
  });

  test('las páginas para empresas tratan de usted', async ({ page }) => {
    for (const ruta of ['/emermedica/', '/servicios/', '/transporte/']) {
      await page.goto(ruta);
      await expect.soft(page.getByRole('main'), ruta).not.toContainText(/\b(tu|tus|te ayudo|buscas)\b/i);
    }
  });
});

test.describe('Precios de Emermédica', () => {
  test('se leen en tarjetas con quién paga y cuánto, en COP @smoke', async ({ page }) => {
    await page.goto('/emermedica/');
    const precios = page.locator('#precios');
    await expect(precios.getByRole('heading', { level: 3 })).toHaveText(['Si la empresa paga el plan', 'Si se descuenta por nómina']);
    await expect(precios.locator('dd')).toHaveText(['$40.000 COP', '$35.900 COP', '$31.500 COP', '$44.200 COP', '$40.100 COP', '$35.700 COP']);
    await expect(precios).toContainText('pesos colombianos (COP)');
  });
});

test.describe('Página de transporte', () => {
  test('muestra la propuesta y el botón de diagnóstico @smoke', async ({ page }) => {
    await page.goto('/transporte/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/grupos de WhatsApp/);
    await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Un solo WhatsApp', 'Cartera y nómina al día', 'Página web que trabaja']);

    const boton = page.getByRole('link', { name: 'Diagnóstico gratis de 30 minutos' });
    await expect(boton).toBeVisible();
    const href = (await boton.getAttribute('href')) ?? '';
    expect(href.startsWith(WHATSAPP)).toBe(true);
    expect(decodeURIComponent(href)).toMatch(/empresa de transporte/);
  });

  test('no está bloqueada para Google', async ({ page }) => {
    await page.goto('/transporte/');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://diegomorenobernal.com/transporte/');
  });
});
