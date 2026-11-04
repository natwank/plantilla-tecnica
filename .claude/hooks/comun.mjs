/**
 * Utilidades compartidas por los hooks. Solo módulos nativos de Node.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, extname, isAbsolute } from 'node:path';

export const RAIZ = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());

/** Lee la llamada que Claude Code pasa por stdin. Devuelve null si no es JSON. */
export function leerLlamada() {
  return new Promise((ok) => {
    let entrada = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (d) => (entrada += d));
    process.stdin.on('end', () => {
      try { ok(JSON.parse(entrada)); } catch { ok(null); }
    });
  });
}

/** Responde a un PreToolUse pidiendo confirmación a la persona, con el motivo. */
export function pedirConfirmacion(motivo) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: motivo,
    },
  }));
}

const EXT_CODIGO = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte', '.astro',
  '.py', '.go', '.rs', '.rb', '.php', '.java', '.kt', '.swift',
  '.css', '.scss', '.html', '.sql', '.prisma', '.graphql',
]);

const CARPETAS_SIN_FICHA = ['docs/', 'changelog/', 'mejoras/', '.claude/', '.github/', '.plantilla/', 'scripts/'];

/** Ruta relativa a la raíz del proyecto, con barras normales. */
export function rutaRelativa(ruta) {
  const abs = isAbsolute(ruta) ? ruta : join(RAIZ, ruta);
  return relative(RAIZ, abs).split('\\').join('/');
}

/** Un archivo "es código" si tiene extensión de código y no vive en una carpeta del protocolo. */
export function esCodigo(rel) {
  if (!rel || rel.startsWith('..')) return false;
  if (CARPETAS_SIN_FICHA.some((c) => rel.startsWith(c))) return false;
  return EXT_CODIGO.has(extname(rel).toLowerCase());
}

export const sinInicializar = () => existsSync(join(RAIZ, '.plantilla'));

/** Fichas de docs/features/ en estado En construcción. */
export function fichasEnConstruccion() {
  const dir = join(RAIZ, 'docs', 'features');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith('.md') && n !== 'README.md')
    .filter((n) => /^\*\*Estado:\*\*\s*En construcción/m.test(readFileSync(join(dir, n), 'utf8')))
    .map((n) => n.replace(/\.md$/, ''));
}
