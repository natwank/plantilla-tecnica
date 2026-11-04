---
name: changelog
description: Registra un cambio en changelog/ con el formato del proyecto (qué se hizo, qué se modificó, por qué y qué requisitos del PRD cierra). Úsala al terminar cualquier cambio importante: feature, fix, refactor, migración, documentación o configuración.
argument-hint: "[cambio que registrar]"
---

Crea una entrada en `changelog/` con el formato de `changelog/README.md`.

1. Archivo: `YYYY-MM-DD_HH-MM_descripcion-breve.md`, con fecha y hora reales (`date`).
2. Si no sabes qué cambio registrar, pregunta.
3. Tres secciones obligatorias: qué se hizo, qué se modificó (archivos), por qué.
4. `Requisitos`: IDs del PRD que el cambio deja terminados. "Ninguno" si es interno; nunca en
   blanco.
5. Si cierra una feature, su ficha debe estar **Verificada** antes de escribir la entrada.
6. Si el cambio deja desfasado algo de `docs/`, actualízalo en esta misma sesión.

Mientras exista `.plantilla/` y el cambio sea sobre la plantilla misma, la entrada va a
`.plantilla/changelog/` (`/empezar` quita estas dos líneas al cerrar la plantilla).
