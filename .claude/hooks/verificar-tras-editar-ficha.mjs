#!/usr/bin/env node
/**
 * Hook PostToolUse para Write/Edit/MultiEdit: al tocar una ficha, verifica la cobertura.
 *
 * Si el archivo editado está en docs/features/, ejecuta scripts/verificar-cobertura.mjs. Si
 * falla, devuelve los fallos al agente en el momento (salida 2 → stderr llega a Claude), en vez
 * de esperar al PR para descubrirlos.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { leerLlamada, rutaRelativa, RAIZ } from './comun.mjs';

const llamada = await leerLlamada();
const ruta = llamada?.tool_input?.file_path;
if (!ruta) process.exit(0);
const rel = rutaRelativa(ruta);
if (!/^docs\/features\/(?!README\.md$).+\.md$/.test(rel)) process.exit(0);

const r = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'verificar-cobertura.mjs')], { cwd: RAIZ, encoding: 'utf8' });
if (r.status === 0) process.exit(0);
process.stderr.write(`La verificación de cobertura falla tras editar ${rel}. Corrige la ficha antes de seguir:\n${r.stdout}`);
process.exit(2);
