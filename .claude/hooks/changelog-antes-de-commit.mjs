#!/usr/bin/env node
/**
 * Hook PreToolUse para Bash: sin changelog no hay commit.
 *
 * Si el comando es un `git commit` y lo que va a entrar en el commit toca código pero no incluye
 * ninguna entrada nueva en changelog/ (o .plantilla/changelog/ mientras exista), pide
 * confirmación. No bloquea: hay commits intermedios legítimos; la persona decide.
 */
import { execFileSync } from 'node:child_process';
import { leerLlamada, pedirConfirmacion, esCodigo, RAIZ } from './comun.mjs';

const llamada = await leerLlamada();
if (llamada?.tool_name !== 'Bash') process.exit(0);
const comando = String(llamada?.tool_input?.command ?? '');
if (!/\bgit\s+commit\b/.test(comando)) process.exit(0);

const git = (...args) => {
  try {
    return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n').map((l) => l.trim()).filter(Boolean);
  } catch { return null; }
};

// Con -a (o --all) entran también los cambios sin preparar; sin él, solo lo preparado.
const incluyeTodo = /\s(-a|--all|-am|-aC)\b/.test(comando);
let archivos = git('diff', '--cached', '--name-only');
if (archivos === null) process.exit(0);
if (incluyeTodo) archivos = [...new Set([...archivos, ...(git('diff', '--name-only') ?? [])])];

const tocaCodigo = archivos.some(esCodigo);
const traeChangelog = archivos.some((a) => /^(\.plantilla\/)?changelog\/.+\.md$/.test(a) && !a.endsWith('README.md'));

if (tocaCodigo && !traeChangelog) {
  pedirConfirmacion(`Este commit toca código (${archivos.filter(esCodigo).slice(0, 3).join(', ')}` +
    `${archivos.filter(esCodigo).length > 3 ? '…' : ''}) y no incluye ninguna entrada nueva en changelog/. ` +
    `AGENTS.md pide registrar cada cambio importante con /changelog. Si es un commit intermedio, confirma.`);
}
process.exit(0);
