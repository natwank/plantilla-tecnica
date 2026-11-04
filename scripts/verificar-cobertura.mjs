#!/usr/bin/env node
/**
 * Verifica que ningún requisito se quede sin forma de comprobarlo.
 *
 * Contrasta docs/prd.md con las fichas de docs/features/ (formato en docs/features/README.md):
 *
 *   PRD     · cada requisito declarado tiene ID único (M-01, S-02, C-03) y criterio con sus tres
 *             partes: dado, cuando, entonces.
 *   Ficha   · cabecera completa (Estado, Requisitos, Acordada el, Pull request) y estados válidos;
 *           · el estado de la ficha concuerda con el de sus requisitos (Verificada ⇔ todos
 *             Validada; Acordada ⇔ todos Pendiente);
 *           · cada ID de "Requisitos" tiene bloque en el plan, y existe en el PRD;
 *           · cada bloque lleva "Se construye en", "Cómo se enseña" (repetible) y "Se valida con";
 *           · "Se valida con" usa una de cuatro formas completas: unitario: · navegador: ·
 *             revisión humana: <qué se mira>; <qué tiene que verse> · sin interfaz: <por qué>; <cómo>;
 *           · en un requisito Validada: los tests existen, apuntan dentro del repositorio y tienen
 *             aserciones; lo de "Se construye en" existe;
 *           · hay sección "Revisión QA"; una ficha En construcción no lleva semanas parada.
 *   Resumen · por ficha, requisitos validados y cuántos van con cada forma; IDs del PRD sin ficha.
 *
 * Es estructural: detecta la promesa incumplida, no el test que comprueba poco. Node sin
 * dependencias. Uso: node scripts/verificar-cobertura.mjs   (sale con 1 si hay fallos)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRD = join(RAIZ, 'docs', 'prd.md');
const FICHAS = join(RAIZ, 'docs', 'features');

const ESTADOS_FICHA = ['Acordada', 'En construcción', 'Verificada'];
const ESTADOS_REQ = ['Pendiente', 'Construida', 'Validada'];
const DIAS_SIN_TOCAR = 21;
const MINIMO_ENSENA = 40;
const MINIMO_PARTE = 8;
const ASERCION = /\b(expect|assert|should|toBe|toEqual|toHaveText|toBeVisible|toMatch)\b/;
const BLOQUE = /^###\s+(\d+)\.\s+([MSC]-\d+)\s+(.*?)\s+[—-]\s+(.+?)\s*$/;

const fallos = [];
const avisos = [];
const fallo = (donde, msg) => fallos.push({ donde, msg });
const aviso = (donde, msg) => avisos.push({ donde, msg });
const sinComentarios = (t) => t.replace(/<!--[\s\S]*?-->/g, '');
const sinBloquesCodigo = (t) => t.replace(/```[\s\S]*?```/g, '');
const limpio = (t) => t.replace(/`/g, '').trim();
const dentro = (ruta) => { const d = resolve(RAIZ, ruta); return d === RAIZ || d.startsWith(RAIZ + sep) ? d : null; };

// ─── PRD ──────────────────────────────────────────────────────────────────────

function leerPrd() {
  if (!existsSync(PRD)) { aviso('docs/prd.md', 'no existe: no se pueden contrastar los IDs'); return new Map(); }
  const ids = new Map();
  // Un requisito puede ocupar varias líneas (la prosa se envuelve a 100 columnas): las de
  // continuación son las que siguen a un `- **[ID]` sin empezar otro elemento.
  const requisitos = [];
  for (const linea of sinBloquesCodigo(sinComentarios(readFileSync(PRD, 'utf8'))).split('\n')) {
    if (/^\s*-\s*\*\*\[[MSC]-\d+\]/.test(linea)) requisitos.push(linea.trim());
    else if (requisitos.length && linea.trim() && !/^\s*([-*#|]|\d+\.)/.test(linea)) requisitos[requisitos.length - 1] += ' ' + linea.trim();
    else if (!linea.trim()) requisitos.push('');
  }
  for (const linea of requisitos) {
    const m = linea.match(/^\s*-\s*\*\*\[([MSC]-\d+)\]\s*([^*]*)\*\*\s*(.*)$/);
    if (!m) continue;
    const [, id, titulo, criterio] = m;
    if (ids.has(id)) fallo('docs/prd.md', `${id} está declarado dos veces`);
    ids.set(id, titulo.trim());
    const c = criterio.toLowerCase();
    const faltan = ['dado', 'cuando', 'entonces'].filter((p) => !c.includes(p));
    if (faltan.length) fallo('docs/prd.md', `${id}: al criterio le falta "${faltan.join('", "')}" (Dado…, cuando…, entonces <resultado observable>)`);
  }
  return ids;
}

// ─── Ficha ────────────────────────────────────────────────────────────────────

const campo = (texto, nombre) => texto.match(new RegExp(`^\\*\\*${nombre}:\\*\\*\\s*(.+)$`, 'm'))?.[1].trim() ?? null;

function seccion(texto, titulo) {
  const lineas = texto.split('\n');
  const ini = lineas.findIndex((l) => new RegExp(`^##\\s+${titulo}\\s*$`).test(l.trim()));
  if (ini === -1) return null;
  const resto = lineas.slice(ini + 1);
  const fin = resto.findIndex((l) => /^##\s/.test(l));
  return (fin === -1 ? resto : resto.slice(0, fin)).join('\n');
}

function bloquesDelPlan(plan) {
  const bloques = [];
  let actual = null;
  for (const linea of plan.split('\n')) {
    const m = linea.match(BLOQUE);
    if (m) { actual = { n: Number(m[1]), id: m[2], titulo: m[3], estado: m[4], campos: {} }; bloques.push(actual); continue; }
    if (!actual) continue;
    const c = linea.match(/^\s*-\s*\*\*(Se construye en|Cómo se enseña|Se valida con):\*\*\s*(.*)$/);
    if (c) { actual.ultimo = c[1]; actual.campos[c[1]] = c[2].trim(); continue; }
    if (actual.ultimo && /^\s{2,}\S/.test(linea)) actual.campos[actual.ultimo] += ' ' + linea.trim();
  }
  return bloques;
}

function validarValidacion(rel, id, texto, validada, resumen) {
  const formas = texto.split('·').map((f) => f.trim()).filter(Boolean);
  if (!formas.length) { fallo(rel, `${id}: "Se valida con" está vacío`); return; }
  for (const forma of formas) {
    const m = forma.match(/^(unitario|navegador|revisi[oó]n humana|sin interfaz):\s*(.*)$/i);
    if (!m) { fallo(rel, `${id}: "${forma}" no empieza por unitario:, navegador:, revisión humana: ni sin interfaz:`); continue; }
    const tipo = m[1].toLowerCase().replace('ó', 'o');
    const resto = m[2].trim();
    if (tipo === 'revision humana' || tipo === 'sin interfaz') {
      const partes = resto.split(';').map((s) => s.trim());
      if (partes.length < 2 || partes[0].length < MINIMO_PARTE || partes[1].length < MINIMO_PARTE) {
        fallo(rel, `${id}: "${m[1]}:" necesita dos partes separadas por punto y coma (${tipo === 'sin interfaz' ? 'por qué; cómo se comprueba' : 'qué se mira; qué tiene que verse'})`);
      } else resumen[tipo === 'sin interfaz' ? 'sinInterfaz' : 'revision']++;
      continue;
    }
    const rutas = resto.split(',').map(limpio).filter(Boolean);
    if (!rutas.length || !rutas.every((r) => r.includes('/') || r.includes('.'))) { fallo(rel, `${id}: "${tipo}:" tiene que llevar la ruta del test`); continue; }
    resumen[tipo]++;
    for (const r of rutas) {
      const d = dentro(r);
      if (!d) { fallo(rel, `${id}: la ruta ${r} apunta fuera del repositorio`); continue; }
      if (!validada) continue;
      if (!existsSync(d)) { fallo(rel, `${id}: está Validada pero ${r} no existe`); continue; }
      if (!ASERCION.test(readFileSync(d, 'utf8'))) fallo(rel, `${id}: ${r} existe pero no tiene ninguna aserción: es un test vacío`);
    }
  }
}

function validarFicha(nombre, idsPrd) {
  const rel = `docs/features/${nombre}`;
  const ruta = join(FICHAS, nombre);
  const texto = sinComentarios(readFileSync(ruta, 'utf8'));
  const resumen = { unitario: 0, navegador: 0, revision: 0, sinInterfaz: 0 };
  const resultado = { ids: new Set(), resumen, estado: null, validados: 0, total: 0 };

  const estado = campo(texto, 'Estado');
  if (!estado) fallo(rel, 'falta **Estado:**');
  else if (!ESTADOS_FICHA.includes(estado)) fallo(rel, `estado "${estado}" no válido (${ESTADOS_FICHA.join(' · ')})`);
  resultado.estado = estado;

  const fecha = campo(texto, 'Acordada el');
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) aviso(rel, 'falta **Acordada el:** en formato AAAA-MM-DD');
  const pr = campo(texto, 'Pull request');
  if (estado === 'Verificada' && (!pr || /pendiente|al cerrar/i.test(pr))) aviso(rel, 'está Verificada y no tiene **Pull request:**');

  const declarados = (campo(texto, 'Requisitos') ?? '').split(',').map(limpio).filter((s) => /^[MSC]-\d+$/.test(s));
  if (!declarados.length) fallo(rel, 'falta **Requisitos:** con al menos un ID (M-01, S-02…)');

  if (seccion(texto, 'Revisión QA') === null) fallo(rel, 'no tiene sección ## Revisión QA (el revisor con contexto limpio pasa antes de construir)');
  if (estado === 'En construcción') {
    const dias = Math.floor((Date.now() - statSync(ruta).mtimeMs) / 86_400_000);
    if (dias > DIAS_SIN_TOCAR) aviso(rel, `lleva ${dias} días En construcción sin cambios`);
  }

  const plan = seccion(texto, 'Plan');
  if (plan === null) { fallo(rel, 'no tiene sección ## Plan'); return resultado; }
  const bloques = bloquesDelPlan(plan);
  if (!bloques.length) { fallo(rel, 'el plan no tiene ningún requisito ("### 1. M-01 Título — Pendiente")'); return resultado; }

  bloques.forEach((b, i) => {
    const id = b.id;
    resultado.ids.add(id);
    resultado.total++;
    if (b.n !== i + 1) aviso(rel, `${id}: el bloque está numerado ${b.n} y le tocaría ${i + 1}`);
    if (!ESTADOS_REQ.includes(b.estado)) { fallo(rel, `${id}: estado "${b.estado}" no válido (${ESTADOS_REQ.join(' · ')})`); return; }
    const validada = b.estado === 'Validada';
    if (validada) resultado.validados++;
    if (idsPrd.size && !idsPrd.has(id)) fallo(rel, `${id}: no está declarado en docs/prd.md`);

    const construye = b.campos['Se construye en'];
    const ensena = b.campos['Cómo se enseña'];
    const valida = b.campos['Se valida con'];
    if (!construye) fallo(rel, `${id}: falta **Se construye en:**`);
    if (!ensena) fallo(rel, `${id}: falta **Cómo se enseña:**`);
    else if (limpio(ensena).length < MINIMO_ENSENA) fallo(rel, `${id}: "Cómo se enseña" tiene que decir qué abrir, qué hacer y qué tiene que aparecer`);
    if (!valida) fallo(rel, `${id}: falta **Se valida con:**`);
    else validarValidacion(rel, id, valida, validada, resumen);

    if (validada && construye) {
      for (const c of construye.split(',').map(limpio).filter((x) => /[/.]/.test(x))) {
        const d = dentro(c);
        if (d && !existsSync(d)) aviso(rel, `${id}: está Validada y "Se construye en" apunta a ${c}, que no existe`);
      }
    }
  });

  for (const id of declarados) if (!resultado.ids.has(id)) fallo(rel, `${id} está en **Requisitos:** pero no tiene bloque en el plan`);
  for (const id of resultado.ids) if (!declarados.includes(id)) fallo(rel, `${id} tiene bloque en el plan pero no está en **Requisitos:**`);

  const estados = bloques.map((b) => b.estado);
  if (estado === 'Verificada' && !estados.every((e) => e === 'Validada')) fallo(rel, 'está Verificada pero no todos los requisitos están Validada');
  if (estado === 'Acordada' && !estados.every((e) => e === 'Pendiente')) fallo(rel, 'está Acordada pero ya hay requisitos empezados: pásala a En construcción');
  if (estado === 'En construcción' && estados.every((e) => e === 'Validada')) aviso(rel, 'todos los requisitos están Validada: la ficha puede pasar a Verificada');
  return resultado;
}

// ─── Ejecución ────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(FICHAS)) { console.log('No existe docs/features/: nada que verificar.'); return 0; }
  const nombres = readdirSync(FICHAS).filter((n) => n.endsWith('.md') && n !== 'README.md').sort();
  const idsPrd = leerPrd();
  if (!nombres.length) {
    if (fallos.length) return imprimir();
    console.log(`Sin fichas de feature todavía. PRD: ${idsPrd.size} requisito(s) con ID y criterio completo.`);
    return 0;
  }
  const cubiertos = new Set();
  const lineas = [];
  for (const n of nombres) {
    const r = validarFicha(n, idsPrd);
    for (const id of r.ids) cubiertos.add(id);
    const s = r.resumen;
    lineas.push(`  ${n.replace(/\.md$/, '')} [${r.estado ?? '?'}] ${r.validados}/${r.total} validados · ` +
      `${s.unitario} unitario(s), ${s.navegador} de navegador, ${s.revision} revisión(es) humana(s), ${s.sinInterfaz} sin interfaz`);
  }
  for (const [id, titulo] of idsPrd) if (!cubiertos.has(id)) aviso('docs/prd.md', `${id} (${titulo}) no tiene ficha todavía`);
  console.log(`\nVerificación de cobertura — ${nombres.length} ficha(s)\n\n${lineas.join('\n')}\n`);
  return imprimir();
}

function imprimir() {
  const porArchivo = new Map();
  for (const f of fallos) { if (!porArchivo.has(f.donde)) porArchivo.set(f.donde, []); porArchivo.get(f.donde).push(f.msg); }
  for (const [donde, msgs] of porArchivo) { console.log(`  ${donde}`); for (const m of msgs) console.log(`    FALLO     ${m}`); console.log(''); }
  for (const a of avisos) console.log(`  ATENCIÓN  ${a.msg}  (${a.donde})`);
  if (avisos.length) console.log('');
  if (!fallos.length) { console.log(avisos.length ? `Sin fallos. ${avisos.length} aviso(s) que no bloquean.\n` : 'Todo en orden.\n'); return 0; }
  console.log(`${fallos.length} fallo(s)${avisos.length ? `, ${avisos.length} aviso(s)` : ''}.\n`);
  return 1;
}

process.exit(main());
