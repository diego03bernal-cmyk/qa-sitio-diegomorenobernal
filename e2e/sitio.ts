/** Mapa del sitio y reglas de negocio que las pruebas verifican. */
import type { Page } from '@playwright/test';

export type Pagina = { ruta: string; titulo: string; menu?: string };

/** Páginas que aparecen en el menú, en su orden. */
export const PAGINAS_DEL_MENU: Pagina[] = [
  { ruta: '/', titulo: 'Diego Moreno Bernal', menu: 'Inicio' },
  { ruta: '/emermedica/', titulo: 'Salud para tu Equipo', menu: 'Salud para empresas' },
  { ruta: '/servicios/', titulo: 'Apoyo Administrativo con IA', menu: 'Servicios' },
  { ruta: '/transporte/', titulo: 'Orden Operativo para Transportadoras', menu: 'Transporte' },
  { ruta: '/viajes/', titulo: 'Viaja con Diego', menu: 'Viajes' },
  { ruta: '/portafolio/', titulo: 'Portafolio Diego Moreno', menu: 'Portafolio' },
];

export const TODAS: Pagina[] = [...PAGINAS_DEL_MENU, { ruta: '/privacidad.html', titulo: 'Política de privacidad' }];

/** Orden exacto del menú. */
export const MENU = PAGINAS_DEL_MENU.map(p => p.menu!);

/** Todo botón de WhatsApp del sitio debe ir al número del asistente. */
export const WHATSAPP = 'https://wa.me/573214292060';

/** Frases que nunca deben aparecer en el sitio. */
export const FRASES_PROHIBIDAS = [/sin sanciones/i, /0 sanciones/i, /experto en impuestos/i, /transcarga/i, /tellevamos/i];

/** Un precio en pesos sin la sigla COP al lado (los servicios se prestan en Colombia). */
export const PRECIO_SIN_COP = /\$\s?\d[\d.]*(?![\d.])(?!\s?COP)/;

/** El menú de las secciones. */
export const menu = (page: Page) => page.getByRole('navigation', { name: 'Secciones' });

/** En el celular el menú está detrás del botón "☰ Menú"; en el computador ya está a la vista. */
export async function abrirMenu(page: Page) {
  // El botón solo existe en pantallas de celular (hasta 760 px, ver comun.css); click() espera a que cargue.
  if ((page.viewportSize()?.width ?? 1280) <= 760) await page.getByRole('button', { name: /Menú/ }).click();
}
