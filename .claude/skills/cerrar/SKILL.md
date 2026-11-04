---
name: cerrar
description: Cierra una feature o un cambio importante: verificación de cobertura, ficha Verificada, changelog, docs/ al día, revisión de seguridad si toca, commit y pull request con la evidencia pegada. Úsala cuando todos los requisitos del plan de la ficha estén Construida o Validada, o cuando la persona pida abrir el PR.
argument-hint: "[nombre-de-la-feature]"
---

Deja el trabajo cerrado y revisable. Nada de aquí se da por hecho sin haberlo ejecutado.

## 1. Validación

1. Si hay ficha: cada requisito del plan tiene su validación hecha. Ejecuta los tests declarados
   y guarda la salida. Haz las revisiones humanas declaradas (qué se mira, qué tiene que verse) y
   anota qué viste. Cada requisito pasa a **Validada**; con todos, la ficha a **Verificada**.
2. `node scripts/verificar-cobertura.mjs`. Si falla, arregla la causa, no el script.
3. Ejecuta los dos niveles de test del proyecto (`docs/testing.md`): unitarios y de navegador.
   Guarda las dos salidas. Si alguno necesita servicios que no están levantados, no lo lances:
   dilo en el PR como "no ejecutado" y por qué.

## 2. Registro

1. `node scripts/podar-docs.mjs`: borra los documentos de `docs/` que nadie ha tocado (CI lo
   exige). Di cuáles se han ido.
2. `/changelog` con el cambio.
3. Actualiza en esta misma sesión lo que el cambio deja desfasado: `docs/` (arquitectura, datos,
   diseño, PRD y roadmap si cambió el alcance), la ficha y el README si cambia cómo se instala o
   usa.
4. Si el cambio toca autenticación, pagos, datos personales o secretos: `/security-review`.

## 3. Commit y PR

1. Rama propia si no la hay (`git switch -c feature/<nombre>`). Commit con mensaje que nombre
   los requisitos (`M-01, M-02: registro con email`).
2. `git push -u origin <rama>`.
3. Abre el PR con `gh pr create` y la plantilla de `.github/pull_request_template.md` rellena
   **entera**: un bloque de evidencia por requisito con la salida real de sus comandos (revisada
   para que no arrastre secretos ni rutas locales), cómo se enseñó, y casillas marcadas solo si
   lo has verificado. Enseña el título y el cuerpo antes de crearlo. Apunta el enlace del PR en
   la ficha (**Pull request:**) y en la entrada del changelog.
4. Comprueba que CI pasa con `gh pr checks`. Si falla, arregla la causa.

Mezclar en `main` y desplegar no es tuyo: déjalo preparado y dilo.
