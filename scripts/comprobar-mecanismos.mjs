#!/usr/bin/env node
/**
 * Comprueba que los mecanismos de la plantilla responden como se espera: cada hook recibe una
 * llamada de ejemplo por stdin y tiene que contestar (o callar) como está previsto, y los tres
 * scripts tienen que arrancar. No comprueba que Claude Code los invoque: eso lo dice la tabla
 * de .claude/SUPUESTOS.md y lo revisa /revisar-herramientas.
 *
 * Uso: node scripts/comprobar-mecanismos.mjs   (sale con 1 si algo no responde)
 */
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
const hayFichaEnConstruccion = () => {
  const dir = join(RAIZ, 'docs', 'features');
  return existsSync(dir) && readdirSync(dir).some((n) => n.endsWith('.md') && n !== 'README.md' &&
    /^\*\*Estado:\*\*\s*En construcción/m.test(readFileSync(join(dir, n), 'utf8')));
};

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hook = (nombre, llamada) => spawnSync(process.execPath, [join(RAIZ, '.claude', 'hooks', nombre)], {
  cwd: RAIZ, encoding: 'utf8', input: JSON.stringify(llamada), env: { ...process.env, CLAUDE_PROJECT_DIR: RAIZ },
});
const pide = (r) => { try { return JSON.parse(r.stdout).hookSpecificOutput?.permissionDecision === 'ask'; } catch { return false; } };

const casos = [
  ['guardia.mjs pide confirmación ante rm -rf',
    () => pide(hook('guardia.mjs', { tool_name: 'Bash', tool_input: { command: 'rm -rf build' } }))],
  ['guardia.mjs calla ante git status',
    () => hook('guardia.mjs', { tool_name: 'Bash', tool_input: { command: 'git status' } }).stdout === ''],
  ['ficha-antes-de-codigo.mjs calla ante un documento',
    () => hook('ficha-antes-de-codigo.mjs', { tool_name: 'Write', tool_input: { file_path: join(RAIZ, 'docs', 'prd.md') } }).stdout === ''],
  ['ficha-antes-de-codigo.mjs pide confirmación ante código sin ficha (o calla si hay una En construcción)',
    () => { const r = hook('ficha-antes-de-codigo.mjs', { tool_name: 'Write', tool_input: { file_path: join(RAIZ, 'src', 'x.ts') } });
      return hayFichaEnConstruccion() ? r.stdout === '' : pide(r); }],
  ['changelog-antes-de-commit.mjs calla si el comando no es git commit',
    () => hook('changelog-antes-de-commit.mjs', { tool_name: 'Bash', tool_input: { command: 'git status' } }).stdout === ''],
  ['verificar-tras-editar-ficha.mjs calla fuera de docs/features/',
    () => hook('verificar-tras-editar-ficha.mjs', { tool_name: 'Edit', tool_input: { file_path: join(RAIZ, 'README.md') } }).status === 0],
  ['estado.mjs arranca',
    () => spawnSync(process.execPath, [join(RAIZ, 'scripts', 'estado.mjs')], { cwd: RAIZ, encoding: 'utf8' }).stdout.includes('Estado del proyecto')],
  ['verificar-cobertura.mjs arranca',
    () => spawnSync(process.execPath, [join(RAIZ, 'scripts', 'verificar-cobertura.mjs')], { cwd: RAIZ, encoding: 'utf8' }).status !== null],
  ['podar-docs.mjs --comprobar arranca y no borra nada',
    () => { const antes = readdirSync(join(RAIZ, 'docs')).length;
      const r = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'podar-docs.mjs'), '--comprobar'], { cwd: RAIZ, encoding: 'utf8' });
      return r.status !== null && readdirSync(join(RAIZ, 'docs')).length === antes; }],
  ['settings.json registra los cinco hooks',
    () => { const s = JSON.stringify(require_json(join(RAIZ, '.claude', 'settings.json')));
      return ['estado.mjs', 'guardia.mjs', 'changelog-antes-de-commit.mjs', 'ficha-antes-de-codigo.mjs', 'verificar-tras-editar-ficha.mjs'].every((h) => s.includes(h)); }],
];

function require_json(p) { return JSON.parse(spawnSync(process.execPath, ['-e', `process.stdout.write(require('fs').readFileSync(${JSON.stringify(p)},'utf8'))`], { encoding: 'utf8' }).stdout); }

let fallos = 0;
for (const [nombre, prueba] of casos) {
  let ok = false;
  try { ok = prueba(); } catch { ok = false; }
  console.log(`${ok ? 'OK   ' : 'FALLO'}  ${nombre}`);
  if (!ok) fallos++;
}
if (!existsSync(join(RAIZ, '.claude', 'SUPUESTOS.md'))) { console.log('FALLO  falta .claude/SUPUESTOS.md'); fallos++; }
console.log(fallos ? `\n${fallos} mecanismo(s) no responden como se espera.` : '\nTodos los mecanismos responden.');
process.exit(fallos ? 1 : 0);
