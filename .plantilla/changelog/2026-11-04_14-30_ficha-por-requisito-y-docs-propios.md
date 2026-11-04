# Ficha como plan por requisito y documentos propios

**Fecha:** 2026-11-04 14:30
**Tipo:** Refactor
**Requisitos:** Ninguno (andamiaje)

## Qué se hizo

- Formato de ficha nuevo (`docs/features/README.md`): un bloque por requisito con estado propio
  (Pendiente · Construida · Validada) y tres campos: "Se construye en", "Cómo se enseña" y "Se
  valida con" (con tipo: `unitario:`, `navegador:`, `revisión humana:`, `sin interfaz:`).
  Sección "Revisión QA" con los hallazgos y su cierre. Campo "Pull request".
- `scripts/verificar-cobertura.mjs` reescrito para el formato nuevo: concordancia entre estado
  de ficha y de requisitos, tres campos por bloque, "Cómo se enseña" repetible, cuatro formas de
  validación, tests con aserciones por requisito Validada. `estado.mjs` dice cuántos requisitos
  van validados y cuál es el siguiente.
- Los ocho documentos de `docs/` reescritos con cabecera "cuándo se consulta / cuándo se
  actualiza", nombres propios y lo que faltaba (arranque en local, quién publica, datos de
  prueba, costes).
- Changelog con "Qué cambia para la persona" y "Cómo se comprobó"; PR con evidencia por
  requisito. AGENTS.md, skills, revisor QA, README y glosario con el vocabulario nuevo.

## Qué se modificó

`docs/`, `docs/features/README.md`, `changelog/README.md`, `scripts/`, `.github/`, `AGENTS.md`,
`.claude/skills/feature`, `.claude/skills/cerrar`, `.claude/agents/revisor-qa.md`,
`.claude/SUPUESTOS.md`, `README.md`, `GLOSARIO.md` (paso a paso), `.plantilla/DECISIONES.md`.

## Por qué

La forma de la ficha y de los documentos era la de la plantilla original. Ahora están
diseñadas para lo que esta plantilla hace: una sesión nueva sabe en qué requisito se quedó, una
persona sin conocimientos técnicos puede comprobar cada requisito con sus manos, el test de
navegador tiene guion, y el verificador exige por requisito y no por ficha.
