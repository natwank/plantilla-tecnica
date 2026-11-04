---
name: feature
description: Crea la ficha de una feature en docs/features/ con su plan por requisito (dónde se construye, cómo se enseña, con qué se valida), antes de escribir código, y la pasa por el revisor QA. Úsala cuando se acuerde construir algo que cierra requisitos del PRD, toca varias capas o dura más de una sesión. No hace falta para un arreglo puntual, un cambio de texto o de estilos.
argument-hint: "[nombre-de-la-feature]"
---

Crea la ficha de una feature siguiendo el formato de `docs/features/README.md`. Se hace
**antes** del código: si ya hay código escrito, lo que toca es un changelog, no una ficha.

## 1. Comprueba que hace falta

Cierra requisitos del PRD, toca varias capas o dura más de una sesión → ficha. Si no, dilo y no
la crees.

## 2. Contexto

Lee `docs/prd.md` y localiza los requisitos (`M-01`, `S-02`…). Si el trabajo no corresponde a
ninguno, pregunta antes de seguir: o es alcance nuevo (va primero al PRD con ID y criterio) o
está fuera (va a `mejoras/`). Lee `architecture.md` y `data-model.md` si la feature toca
estructura o datos. En Claude Code, haz esta fase en modo plan.

## 3. Pregunta lo que no puedas deducir

Nombre (el archivo será `kebab-case.md`), qué podrá hacer el usuario cuando exista, qué queda
fuera.

## 4. Escribe la ficha

Estado **Acordada**, todos los requisitos **Pendiente**, en el orden en que se construirán. Cada
bloque con sus tres campos: **Se construye en** (archivos), **Cómo se enseña** (qué abrir, qué
hacer, qué tiene que aparecer: repetible por alguien que no programa) y **Se valida con**
(`unitario:` para lógica, `navegador:` para todo lo que tiene pantalla, `revisión humana: qué se
mira; qué tiene que verse`, `sin interfaz: por qué; cómo se comprueba`). Si no sabes cuál poner,
pregunta. No uses la revisión humana para lo que un test cubriría bien. Deja la sección
"Revisión QA" preparada: se rellena en el paso siguiente.

## 5. Revisión QA con contexto limpio

No revises tú lo que acabas de redactar. En Claude Code lanza el subagente `revisor-qa` con la
ruta de la ficha; con otro agente, abre una conversación nueva, pega el contenido de
`.claude/agents/revisor-qa.md` como instrucciones y la ruta de la ficha.

Presenta a la persona la lista numerada tal cual llega, **sin soluciones**: si las propones a la
vez, acepta la tuya sin pensar la suya. Cada punto se cierra de una de tres formas: se corrige la
ficha (o el PRD), pasa a "Decisiones" o pasa a "Fuera de esta feature". Anota en la sección
"Revisión QA" la fecha, los hallazgos y cómo se cerró cada uno. Si la ficha cambia mucho, repite.

## 6. Confirma y construye un requisito cada vez

Con el visto bueno, la ficha pasa a **En construcción**. Cada bloque del plan es una unidad:
implementa el requisito, enséñalo haciendo exactamente lo que dice su "Cómo se enseña", y
**para**. Con el visto bueno, el requisito pasa a **Construida** y empieza el siguiente, salvo
que te pidan avanzar varios. Los tests van después, en su pasada propia (`docs/testing.md`), y
cada requisito pasa a **Validada** cuando su test pasa o su revisión está hecha. Mantén los
estados al día en el momento. Cuando todos estén Validada, `/cerrar`.
