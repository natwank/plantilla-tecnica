---
name: revisar-herramientas
description: Comprueba si la plantilla sigue al día con Claude Code, Codex y la plantilla madre. Compara la versión instalada con la validada en AGENTS.md, lee el changelog oficial entre ambas, contrasta cada supuesto de .claude/SUPUESTOS.md, ejecuta scripts/comprobar-mecanismos.mjs y propone cambios uno a uno con su fuente. Úsala cuando el estado no se imprima al arrancar, cuando una herramienta se haya actualizado, al retomar el proyecto tras semanas, o cada mes.
---

La plantilla no sabe qué harán las herramientas dentro de un mes; sabe qué da por supuesto hoy.
Esta skill comprueba esos supuestos contra la fuente oficial y propone. **No aplica nada sin
visto bueno** y no toca el protocolo (docs, fichas, changelog): solo los mecanismos.

## 1. Versiones

1. `claude --version` y, si existe, `codex --version`. Compáralas con la nota "Plantilla:" de
   `AGENTS.md` y con "Validada con" de `.claude/SUPUESTOS.md`.
2. `node scripts/comprobar-mecanismos.mjs`. Lo que falle ahí es un mecanismo roto de nuestro
   lado, se arregla primero.
3. Pregunta: "¿Al arrancar esta sesión apareció el bloque 'Estado del proyecto'?" Si no, el hook
   `SessionStart` ha dejado de funcionar: supuesto 4 o 9 en duda.

Si la versión instalada es la validada y todo responde, dilo en una línea y para.

## 2. Qué ha cambiado en las herramientas

Solo fuentes oficiales:

- Claude Code: el `CHANGELOG.md` del repositorio `anthropics/claude-code` en GitHub y la
  documentación en docs.claude.com (hooks, settings, skills, subagentes, MCP).
- Codex: las notas de versión del repositorio `openai/codex` y su documentación.

Lee las entradas entre la versión validada y la instalada. Por cada entrada, mira si toca algún
supuesto de la tabla: formato de `settings.json`, eventos y respuestas de hooks, cabecera de
skills o subagentes, comandos `claude mcp`, `gh`. Apunta también funciones nuevas que harían
mejor lo que hoy hace un mecanismo de la plantilla (un evento de hook nuevo, un campo nuevo en
las skills, una forma nueva de compartir memoria entre sesiones).

## 3. La plantilla madre

Si `.claude/SUPUESTOS.md` tiene la URL del repositorio de la plantilla, baja su última versión a
una carpeta temporal (`gh repo clone <url> <tmp> -- --depth 1`) y compara solo los mecanismos:
`diff -r <tmp>/.claude .claude` y `diff -r <tmp>/scripts scripts`. Lo que la plantilla haya
mejorado desde que este proyecto nació aparece ahí.

## 4. Propón y aplica

Una propuesta cada vez, con: qué cambia, por qué (la entrada del changelog o el diff que lo
motiva, citada), qué archivo toca y cómo se comprueba después. Con el visto bueno, aplícala y
ejecuta `node scripts/comprobar-mecanismos.mjs`.

Al terminar:

- Actualiza "Validada con" en `.claude/SUPUESTOS.md` y la nota "Plantilla:" de `AGENTS.md`.
- Añade o corrige las filas de supuestos que hayan cambiado.
- Registra el cambio con `/changelog` (Configuración).
- Si una mejora vale para todos los proyectos, dilo: va a la plantilla madre, y de ahí a los
  demás.
