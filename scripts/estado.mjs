#!/usr/bin/env node
/**
 * Estado del proyecto en diez líneas. Lo ejecuta el hook SessionStart de Claude Code (y
 * cualquiera a mano): si está inicializado, qué documentos quedan por rellenar, qué fichas hay
 * y en qué estado, el último cambio registrado y cuántas ideas hay en el backlog.
 *
 * Solo lee. No necesita dependencias. Uso: node scripts/estado.mjs
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sinTocar } from './podar-docs.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const en = (...p) => join(RAIZ, ...p);
const leer = (ruta) => (existsSync(ruta) ? readFileSync(ruta, 'utf8') : '');
const pendientes = (texto) => (texto.match(/_\(pendiente/g) ?? []).length;
const md = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'README.md').sort() : [];

const lineas = [];

// Inicialización
if (existsSync(en('.plantilla'))) {
  lineas.push('Proyecto SIN inicializar: existe .plantilla/. Carga /empezar antes de nada.');
} else {
  lineas.push('Proyecto inicializado.');
}

// Plantilla y versión validada
const nota = leer(en('AGENTS.md')).match(/^\*\*Plantilla:\*\*\s*(.+)$/m);
if (nota) lineas.push(`Plantilla: ${nota[1].split(/\.\s/)[0].trim()}. Si la herramienta es más nueva, /revisar-herramientas.`);

// AGENTS.md
const faltanAgents = pendientes(leer(en('AGENTS.md')));
if (faltanAgents) lineas.push(`AGENTS.md: ${faltanAgents} campo(s) pendiente(s) por rellenar en /empezar.`);

// docs/
const DOCS = ['prd', 'architecture', 'testing', 'design-system', 'data-model', 'roadmap', 'user-flows', 'business'];
const completos = [];
const parciales = [];
const intactos = [];
const ausentes = [];
for (const d of DOCS) {
  const ruta = en('docs', `${d}.md`);
  if (!existsSync(ruta)) { ausentes.push(d); continue; }
  const texto = leer(ruta);
  if (sinTocar(texto)) { intactos.push(d); continue; }
  const n = pendientes(texto);
  (n === 0 ? completos : parciales).push(n === 0 ? d : `${d} (${n})`);
}
lineas.push((`docs/: ${completos.length ? `completos: ${completos.join(', ')}. ` : ''}` +
  `${parciales.length ? `con pendientes: ${parciales.join(', ')}. ` : ''}` +
  `${intactos.length ? `sin tocar: ${intactos.join(', ')} (los opcionales se borran solos al cerrar; node scripts/podar-docs.mjs). ` : ''}` +
  `${ausentes.length && existsSync(en('.plantilla')) ? `no existen: ${ausentes.join(', ')}.` : ''}`).trim());

// Fichas
const fichas = md(en('docs', 'features'));
if (fichas.length === 0) {
  lineas.push('Fichas: ninguna todavía.');
} else {
  const porEstado = fichas.map((n) => {
    const t = leer(en('docs', 'features', n));
    const m = t.match(/^\*\*Estado:\*\*\s*(.+)$/m);
    const bloques = t.match(/^###\s+\d+\.\s+[MSC]-\d+\s+.*?\s+[—-]\s+(Pendiente|Construida|Validada)\s*$/gm) ?? [];
    const validados = bloques.filter((l) => /Validada\s*$/.test(l)).length;
    const siguiente = bloques.find((l) => !/Validada\s*$/.test(l))?.match(/([MSC]-\d+)/)?.[1];
    return `${n.replace(/\.md$/, '')} [${m ? m[1].trim() : 'sin estado'}, ${validados}/${bloques.length} validados${siguiente ? `, siguiente ${siguiente}` : ''}]`;
  });
  lineas.push(`Fichas (${fichas.length}): ${porEstado.join(', ')}.`);
  const aMedias = porEstado.filter((f) => f.includes('[En construcción]'));
  if (aMedias.length) lineas.push(`Trabajo a medias: ${aMedias.join(', ')}. Léela antes de proponer nada nuevo.`);
}

// Changelog
const cambios = md(en('changelog'));
lineas.push(cambios.length
  ? `Último cambio registrado: ${cambios[cambios.length - 1]} (${cambios.length} en total).`
  : 'Changelog: sin entradas todavía.');

// Mejoras
const sinBloques = (t) => t.replace(/```[\s\S]*?```/g, '');
const ideas = (sinBloques(leer(en('mejoras', 'backlog.md'))).match(/^###\s+\[MEJORA-/gm) ?? []).length;
lineas.push(`Backlog de mejoras: ${ideas} idea(s).`);

console.log(['── Estado del proyecto ──', ...lineas.map((l) => `• ${l}`)].join('\n'));
