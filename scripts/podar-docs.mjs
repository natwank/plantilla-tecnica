#!/usr/bin/env node
/**
 * Borra los documentos de `docs/` que nadie ha tocado.
 *
 * La plantilla trae ocho documentos y solo dos son obligatorios (`prd.md`, `architecture.md`).
 * Los otros seis aplican según el proyecto. Un documento que no aplica tiene que desaparecer,
 * no quedarse con marcadores `_(pendiente…)_`: si se queda, el estado de arranque lo reclama en
 * cada sesión y el protocolo se abandona.
 *
 * Cómo sabe que un documento está sin tocar: cada documento de la plantilla termina con una
 * línea `<!-- huella: … -->` que es el resumen (hash) de su propio contenido tal como vino. Si
 * el contenido sigue dando la misma huella, nadie ha escrito en él. Una sola palabra cambiada
 * y la huella deja de coincidir: el documento se queda, aunque tenga pendientes, y esos se
 * rellenan. Así no se pierde nunca nada escrito. La huella viaja dentro del documento, de modo
 * que la regla funciona también después de borrar `.plantilla/` y con documentos que se creen
 * más adelante a partir de la plantilla.
 *
 * Los obligatorios nunca se borran; si están sin tocar, se avisa. A los documentos que se quedan
 * porque tienen contenido se les retira la línea de huella: ya no la necesitan y un documento
 * relleno no debe terminar diciendo "plantilla sin tocar".
 *
 * Uso:  node scripts/podar-docs.mjs              borra los opcionales sin tocar y dice cuáles
 *       node scripts/podar-docs.mjs --comprobar  no borra; sale con 1 si queda alguno (CI)
 *       node scripts/podar-docs.mjs --sellar     reescribe las huellas (solo al editar la
 *                                                plantilla misma, nunca en un proyecto)
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(RAIZ, 'docs');
export const OBLIGATORIOS = ['prd.md', 'architecture.md'];

const LINEA_HUELLA = /\n*<!-- huella: ([0-9a-f]{12})[^>]*-->\s*$/;

/** Resumen del contenido sin la línea de huella, insensible a finales de línea y espacio final. */
export function huella(texto) {
  const cuerpo = texto.replace(LINEA_HUELLA, '').replace(/\r\n/g, '\n').trimEnd();
  return createHash('sha256').update(cuerpo).digest('hex').slice(0, 12);
}

/** Sin tocar = trae huella y el contenido sigue dando esa misma huella. */
export function sinTocar(texto) {
  const m = texto.match(LINEA_HUELLA);
  return Boolean(m) && m[1] === huella(texto);
}

const documentos = () =>
  existsSync(DOCS) ? readdirSync(DOCS).filter((n) => n.endsWith('.md')).sort() : [];

/** Clasifica `docs/*.md` (sin `features/`): qué sobra y qué obligatorio sigue sin tocar. */
export function clasificar() {
  const sobran = [];
  const obligatoriosSinTocar = [];
  for (const nombre of documentos()) {
    if (!sinTocar(readFileSync(join(DOCS, nombre), 'utf8'))) continue;
    (OBLIGATORIOS.includes(nombre) ? obligatoriosSinTocar : sobran).push(nombre);
  }
  return { sobran, obligatoriosSinTocar };
}

function sellar() {
  for (const nombre of documentos()) {
    const ruta = join(DOCS, nombre);
    const cuerpo = readFileSync(ruta, 'utf8').replace(LINEA_HUELLA, '').trimEnd();
    writeFileSync(ruta, `${cuerpo}\n\n<!-- huella: ${huella(cuerpo)} · plantilla sin tocar; scripts/podar-docs.mjs la usa -->\n`);
    console.log(`SELLADO  docs/${nombre}`);
  }
  return 0;
}

/** Un documento con contenido no necesita huella: se le quita la línea. */
function retirarHuellas() {
  for (const nombre of documentos()) {
    const ruta = join(DOCS, nombre);
    const texto = readFileSync(ruta, 'utf8');
    if (!LINEA_HUELLA.test(texto) || sinTocar(texto)) continue;
    writeFileSync(ruta, `${texto.replace(LINEA_HUELLA, '').trimEnd()}\n`);
    console.log(`LIMPIO   docs/${nombre} (tiene contenido: se retira la línea de huella)`);
  }
}

function main() {
  if (process.argv.includes('--sellar')) return sellar();
  const comprobar = process.argv.includes('--comprobar');
  if (comprobar && existsSync(join(RAIZ, '.plantilla'))) {
    console.log('Plantilla sin inicializar (existe .plantilla/): la comprobación aplica a proyectos, no a la plantilla.');
    return 0;
  }
  const { sobran, obligatoriosSinTocar } = clasificar();

  for (const nombre of obligatoriosSinTocar) {
    console.log(`ATENCIÓN  docs/${nombre} es obligatorio y está sin tocar: no se borra, se rellena.`);
  }

  if (sobran.length === 0) {
    if (!comprobar) retirarHuellas();
    console.log('docs/: nada que podar.');
    return 0;
  }

  if (comprobar) {
    for (const nombre of sobran) console.log(`FALLO  docs/${nombre} está sin tocar: o se rellena o se borra.`);
    console.log(`\n${sobran.length} documento(s) sin tocar. Se borran con: node scripts/podar-docs.mjs`);
    return 1;
  }

  for (const nombre of sobran) {
    unlinkSync(join(DOCS, nombre));
    console.log(`BORRADO  docs/${nombre} (estaba tal como vino en la plantilla)`);
  }
  retirarHuellas();
  console.log(`\n${sobran.length} documento(s) borrado(s). Si alguno hace falta más adelante, /documentacion lo vuelve a crear.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
