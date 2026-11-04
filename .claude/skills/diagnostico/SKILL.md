---
name: diagnostico
description: Parte de solo lectura del estado del proyecto y del entorno (documentos, fichas, cobertura, Node y gestor de paquetes, variables, MCPs, tests) con la corrección propuesta para cada fallo. Úsala al entrar por primera vez, antes de una sesión larga o cuando algo falle sin motivo aparente. No arregla nada.
---

Diagnostica y propone; no toques nada. Al final, la persona decide qué aplicar.

No es el `/doctor` de Claude Code, que revisa la instalación del agente; esto revisa el proyecto.

## Comprobaciones

1. **Estado**: `node scripts/estado.mjs`. Documentos con pendientes, fichas a medias, `.plantilla/`.
2. **Cobertura**: `node scripts/verificar-cobertura.mjs`, salida tal cual. Añade lo que el script
   no ve: tests declarados que existen pero están vacíos o sin aserciones (FALLO aunque pase).
3. **Entorno**: versión de Node y del gestor de paquetes frente a lo que declara `AGENTS.md`;
   `node_modules/` instalado y lockfile al día.
4. **Variables**: compara los nombres de `.env.example` con los definidos en el entorno o en
   `.env.local`. Reporta **solo nombres que faltan**. `.env.example` se lee entero (no tiene
   valores); los archivos con valores (`.env`, `.env.local`…) están denegados a propósito: usa
   `grep -c` sobre nombres si hace falta, nunca `cat`.
5. **MCPs**: `claude mcp list` frente a la tabla de `docs/architecture.md`.
6. **Tests**: ¿existe el comando que declara `docs/testing.md`? Si es barato, ejecútalo y reporta
   la salida real; si no, di que no se ha ejecutado y por qué.

## Informe

Una tabla, un renglón por comprobación, tres estados: **OK**, **ATENCIÓN** (funciona, hay deuda),
**FALLO** (roto o falta). Para cada FALLO, el comando exacto que lo arregla. Si todo está bien,
una línea.
