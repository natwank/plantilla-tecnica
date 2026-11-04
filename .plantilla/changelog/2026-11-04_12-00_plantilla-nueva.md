# Plantilla nueva a partir de project-template

**Fecha:** 2026-11-04 12:00
**Tipo:** Configuración
**Requisitos:** Ninguno (andamiaje)

## Qué se hizo

Se crea la plantilla desde cero tomando como base `project-template` de Pol Marzà (MIT) y
aplicando cómo funcionan hoy los agentes de código. Se conserva el protocolo entero (documentos,
MoSCoW con IDs y criterios, ficha por feature, tabla de cobertura verificada por script,
changelog, PR con evidencia, protocolo de MCPs, límites de ejecución) y cambia su encaje:

- `AGENTS.md` pasa a reglas solas, por debajo de 150 líneas; los datos del proyecto van como
  marcadores visibles `_(pendiente)_`, no en comentarios HTML.
- Procedimientos en skills cortas. Nuevas: `/empezar` (sustituye a `/init-proyecto` e incluye
  git y GitHub) y `/cerrar` (validación, changelog, docs, PR).
- La revisión QA de la ficha la hace un subagente con contexto limpio (`.claude/agents/revisor-qa.md`).
- Dos hooks: `SessionStart` imprime `scripts/estado.mjs`; `PreToolUse` sobre Bash convierte en
  pregunta los comandos destructivos (`.claude/hooks/guardia.mjs`).
- Permisos: lectura de `.env*` denegada; git y gh de solo lectura y commits sin preguntar.
- Gestor de paquetes sin fijar (se decide en `/empezar`).
- `.template/` pasa a `.plantilla/` con `DECISIONES.md`.

## Qué se modificó

Todo el repositorio es nuevo. `scripts/verificar-cobertura.mjs` se conserva del original con
atribución.

## Por qué

La plantilla original está pensada para founders técnicos y carga procedimientos y ejemplos en
cada sesión. Esta separa lo que se carga siempre de lo que se carga cuando toca, convierte en
mecanismo (hooks, permisos, subagente) lo que antes dependía de que el modelo se acordara, y
sirve de núcleo para dos versiones: técnica y paso a paso.
