# Pruebas E2E de diegomorenobernal.com

[![Pruebas del sitio](https://github.com/diego03bernal-cmyk/qa-sitio-diegomorenobernal/actions/workflows/pruebas.yml/badge.svg)](https://github.com/diego03bernal-cmyk/qa-sitio-diegomorenobernal/actions/workflows/pruebas.yml)

Proyecto de QA sobre un sitio real en producción: **[diegomorenobernal.com](https://diegomorenobernal.com)**, mi sitio profesional. Pruebas automáticas con **Playwright + TypeScript** que revisan el sitio en vivo en **computador y celular** (Pixel 7) y corren solas todos los días en GitHub Actions.

**Autor:** Diego Alejandro Moreno Bernal · QA Testing (TripleTen, 2025) · Bogotá, Colombia

## Por qué este proyecto

El sitio tiene reglas de negocio concretas que no se pueden romper al cambiar un texto o el diseño. Estas pruebas las convierten en verificaciones automáticas:

- Todo botón de WhatsApp lleva al número del asistente.
- Los precios se muestran en pesos colombianos (COP).
- Dos marcas que represento nunca aparecen en la misma página.
- Ciertas frases están prohibidas (promesas que no se pueden hacer).
- Las páginas para empresas tratan de "usted".
- En el celular nada se sale de la pantalla y el menú muestra todas las secciones.

## Qué se prueba

| Archivo | Qué revisa |
|---|---|
| `navegacion.spec.ts` | Menú igual en todas las páginas y en el mismo orden, sección actual marcada (`aria-current`), recorrer el sitio solo con el menú, tarjetas del inicio, enlace a la página de transporte y redirección del portafolio antiguo |
| `contenido.spec.ts` | Reglas de negocio: frases prohibidas, precios con COP, WhatsApp correcto y a la vista, separación de marcas, trato de usted, sin errores de JavaScript, precios de Emermédica, página de transporte completa e indexable |
| `enlaces.spec.ts` | Ningún enlace interno roto; la vista previa vieja ya no existe |
| `movil.spec.ts` | En el celular: sin desbordes laterales y el botón "☰ Menú" abre y cierra todas las opciones |

Las reglas de negocio están en un solo lugar: [`e2e/sitio.ts`](e2e/sitio.ts).

## Decisiones técnicas

- **Localizadores accesibles** (`getByRole`, nombres visibles), no selectores CSS: si una prueba no encuentra un botón, probablemente un usuario con lector de pantalla tampoco.
- **Sin esperas fijas** (`waitForTimeout`): solo aserciones que esperan solas.
- **Dos proyectos** (escritorio y móvil) en vez de archivos duplicados.
- **Reintentos acotados** (2) por cortes de red; una falla real falla las tres veces y queda con traza y captura.
- **Errores de JavaScript del sitio** se reportan; las descargas fallidas de recursos externos se dejan a la prueba de enlaces.

## Cómo correrlas

```bash
npm install        # solo la primera vez
npm test           # toda la suite (escritorio + celular)
npm run test:movil # solo celular
npx playwright test --grep @smoke   # solo las esenciales
npm run reporte    # abre el reporte HTML
```

Usa el Chrome instalado en el equipo (`channel: 'chrome'`), así que no descarga navegadores.
Para probar otra copia del sitio: `BASE_URL=https://otra-url npm test`.

En GitHub Actions corren todos los días a las 7:00 a. m. (hora de Colombia), en cada cambio y con el botón **Run workflow**. El reporte HTML queda como artefacto de cada corrida.
