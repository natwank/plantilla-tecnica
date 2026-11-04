#!/usr/bin/env node
/**
 * Hook PreToolUse para Write/Edit/MultiEdit: sin ficha no hay código.
 *
 * Si el archivo que se va a escribir es código (no docs, changelog, skills…) y no hay ninguna
 * ficha En construcción, pide confirmación a la persona. AGENTS.md permite arreglos puntuales
 * sin ficha, así que no bloquea: pregunta, y la persona decide. Si el proyecto todavía no está
 * inicializado (existe .plantilla/), también pregunta: no se escribe código sin PRD.
 */
import { leerLlamada, pedirConfirmacion, rutaRelativa, esCodigo, sinInicializar, fichasEnConstruccion } from './comun.mjs';

const llamada = await leerLlamada();
const ruta = llamada?.tool_input?.file_path;
if (!ruta) process.exit(0);

const rel = rutaRelativa(ruta);
if (!esCodigo(rel)) process.exit(0);

if (sinInicializar()) {
  pedirConfirmacion(`Vas a escribir código (${rel}) y el proyecto no está inicializado: existe .plantilla/ ` +
    `y no hay PRD acordado. AGENTS.md pide pasar primero por /empezar.`);
  process.exit(0);
}

if (fichasEnConstruccion().length === 0) {
  pedirConfirmacion(`Vas a escribir código (${rel}) sin ninguna ficha En construcción en docs/features/. ` +
    `Si es una feature, crea antes la ficha con /feature. Si es un arreglo puntual, un cambio de ` +
    `texto o de estilos, AGENTS.md lo permite sin ficha: confirma y registra el cambio en el changelog.`);
}
process.exit(0);
