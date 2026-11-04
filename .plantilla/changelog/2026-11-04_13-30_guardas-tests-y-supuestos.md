# Guardas nuevas, dos niveles de test y registro de supuestos

**Fecha:** 2026-11-04 13:30
**Tipo:** Configuración
**Requisitos:** Ninguno (andamiaje)

## Qué se hizo

- Tres hooks más (`ficha-antes-de-codigo`, `changelog-antes-de-commit`,
  `verificar-tras-editar-ficha`) y un módulo común. Sin ficha no hay código, sin changelog no
  hay commit, y el verificador corre al editar una ficha. Preguntan, no deniegan.
- `scripts/verificar-cobertura.mjs` reescrito: criterios del PRD con dado/cuando/entonces, tests
  con aserciones, "Se implementa en" existente al cerrar, fichas olvidadas, resumen por tipo.
- `docs/testing.md` fija dos niveles (unitario y navegador) con Vitest y Playwright como
  propuesta; la ficha asigna tipo por requisito; `/cerrar` ejecuta ambos.
- `.claude/SUPUESTOS.md`, `scripts/comprobar-mecanismos.mjs` y `/revisar-herramientas`: la
  plantilla registra qué asume de las herramientas y cómo revisarlo cuando cambien. Nota de
  versión validada en `AGENTS.md`, que `estado.mjs` imprime.

## Qué se modificó

`.claude/settings.json`, `.claude/hooks/`, `.claude/SUPUESTOS.md`, `.claude/skills/`
(`cerrar`, `empezar`, `feature`, `revisar-herramientas`), `scripts/`, `docs/testing.md`,
`docs/features/README.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.plantilla/DECISIONES.md`.

## Por qué

Tres de las cuatro garantías del protocolo (MoSCoW antes del código, ficha antes de implementar,
changelog por cambio) dependían de que el modelo siguiera la instrucción. Ahora tienen mecanismo.
Y una plantilla validada hoy no sabe qué cambiará en las herramientas: lo que puede hacer es
saber qué da por supuesto y comprobarlo.
