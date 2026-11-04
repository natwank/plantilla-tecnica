# Poda automática de documentos

**Fecha:** 2026-11-04 15:30
**Tipo:** Configuración
**Requisitos:** Ninguno (andamiaje)

## Qué se hizo

- `scripts/podar-docs.mjs`: borra los documentos opcionales de `docs/` que siguen tal como
  vinieron en la plantilla. Lo sabe por la línea `<!-- huella: … -->` que ahora cierra cada
  documento (resumen de su contenido). `--comprobar` para CI, `--sellar` para la plantilla.
- `estado.mjs` distingue "sin tocar" de "con pendientes"; `comprobar-mecanismos.mjs` prueba el
  script; el workflow de CI falla si queda un documento intacto.
- `/documentacion`, `/empezar` y `/cerrar` ejecutan la poda en vez de pedir que se borre a mano.
- README, AGENTS.md y `/documentacion` dicen "dos obligatorios y hasta seis más" en vez de "ocho".
- `.claude/SUPUESTOS.md` fila 18; `DECISIONES.md` sección 16.

## Por qué

Un documento vacío que nadie borra es la grieta por donde se abandona el protocolo, y "bórralos
a mano" es un paso que se olvida. La regla por huella borra sin preguntar y sin poder perder
nada escrito.

## Cómo se comprobó

En una copia intacta, `--comprobar` lista los seis opcionales y avisa de los dos obligatorios;
tras escribir una línea en `roadmap.md` y una fila en `business.md` (y pasar `user-flows.md` a
CRLF), la poda borra los otros cuatro y deja esos dos. Segunda pasada: nada que podar.
