# Changelog

**Cuándo se consulta:** al retomar el proyecto ("¿qué se hizo la última vez?") y al preguntarse
por qué algo está como está. **Cuándo se escribe:** al cerrar cada cambio importante, con
`/changelog`, en la misma sesión. Empieza vacío a propósito.

Un archivo por cambio: `AAAA-MM-DD_HH-MM_descripcion-breve.md`.

```markdown
# Descripción breve del cambio

**Fecha:** AAAA-MM-DD HH:MM
**Tipo:** Feature / Fix / Refactor / Migración / Documentación / Configuración
**Requisitos:** M-01, M-02 (o "Ninguno" si es interno)
**Ficha:** docs/features/nombre.md (si la hay)
**Pull request:** enlace (si lo hay)

## Qué cambia para la persona que usa el producto

Una o dos frases en lenguaje llano. Si no cambia nada visible, dilo.

## Qué se tocó

Archivos o carpetas, con una palabra sobre qué pasó en cada uno.

## Por qué

Lo que motivó el cambio y, si hubo alternativas, por qué esta.

## Cómo se comprobó

Los comandos ejecutados con su resultado en una línea ("npm test → 42 pasan"), las revisiones
humanas hechas (qué se miró, qué se vio) y lo que no se ejecutó, con el motivo.
```

Este archivo explica el formato; no es una entrada.
