# AGENTS.md

Contrato para cualquier agente de código que trabaje en este proyecto (Claude Code, Codex,
Cursor…). Léelo entero antes de cambiar nada. Aquí van reglas; los procedimientos son skills en
`.claude/skills/<nombre>/SKILL.md`. "Carga `/feature`" significa: en Claude Code, lanzar
`/feature`; en otro agente, abrir `.claude/skills/feature/SKILL.md` y seguirlo entero.

## Al empezar una sesión

1. Mira el estado del proyecto. En Claude Code lo imprime un hook al arrancar; si no lo ves,
   ejecuta `node scripts/estado.mjs`.
2. Si existe `.plantilla/`, el proyecto **no está inicializado**: carga `/empezar` y no escribas
   código ni rellenes documentos por tu cuenta.
3. Si hay una ficha en `docs/features/` **En construcción**, ese es el trabajo a medias. Léela
   antes de proponer nada nuevo.
4. Si algo no cuadra (tests que no arrancan, variables que faltan), `/diagnostico` da el parte.

## Documentación

`docs/` describe el proyecto entero. Qué documentos aplican según el tamaño del proyecto y en qué
orden se rellenan está en `/documentacion`. `prd.md` y `architecture.md` no se saltan nunca. Un
documento que nadie ha tocado **se borra solo** (`scripts/podar-docs.mjs`, al empezar, al cerrar
y en CI); uno con una línea escrita se queda y se termina. Si el proyecto crece, se crean los que
falten en ese momento.

Cada funcionalidad del PRD lleva un identificador estable (`M-01`, `S-02`, `C-03`, por MoSCoW) y
un criterio de aceptación "Dado…, cuando…, entonces…" con un resultado observable.

## Ciclo de una feature

Una feature es lo que se acuerda, se construye y se cierra de una vez. Su ficha en
`docs/features/` dice en qué punto está y se actualiza en el momento, no al final.

1. **Acordar.** `/feature` escribe la ficha (estado **Acordada**) con un plan: un bloque por
   requisito con dónde se construye, cómo se enseña y con qué se valida. La pasa por el revisor
   QA antes de enseñarla; los hallazgos se resuelven con la persona y solo entonces se construye.
2. **Construir.** Estado **En construcción**. Un requisito cada vez, en el orden del plan:
   implementa, enséñalo siguiendo su "Cómo se enseña", y para. Con el visto bueno, el requisito
   pasa a **Construida** y empieza el siguiente, salvo que te pidan avanzar varios.
3. **Validar.** Con el código escrito, los tests y revisiones humanas que declara cada requisito,
   escritos después de implementar leyendo el código real. Cada requisito pasa a **Validada**;
   con todos, la ficha pasa a **Verificada**.
4. **Cerrar.** `/cerrar`: verificación de cobertura, changelog, `docs/` al día y PR con evidencia.

No hace falta ficha para un arreglo puntual, un cambio de texto o un ajuste de estilos: basta el
changelog.

**La regla que lo sostiene:** ningún requisito se queda sin "Se valida con". Lleva una de cuatro
formas: `unitario:` ruta (lógica); `navegador:` ruta (todo lo que tiene pantalla);
`revisión humana: <qué se mira>; <qué tiene que verse>`; o `sin interfaz: <por qué>; <cómo se
comprueba>`. `scripts/verificar-cobertura.mjs` lo comprueba al editar la ficha, al cerrar y en
CI. Si no sabes cuál poner, pregunta.

## Cambios y pull requests

- Cada cambio importante deja entrada en `changelog/` (`/changelog`). Mientras exista
  `.plantilla/`, los cambios sobre la plantilla misma van a `.plantilla/changelog/`.
- Si el cambio deja desfasado un documento de `docs/`, una ficha o el README, se actualiza en la
  misma sesión.
- Los PR los abre el agente con la plantilla de `.github/` rellena entera. Se pega la salida real
  de los comandos, no se parafrasea. Se marca solo lo verificado; lo demás se explica.
- `/security-review` antes de mezclar en producción.
- Las ideas que no entran ahora van a `mejoras/` con `/mejora`.

## Servidores MCP

Configurarlos es decisión de la persona: pregunta, no instales por tu cuenta. El momento de sacar
el tema es al cerrar `docs/architecture.md` y cada vez que entre una integración nueva. Fuente
oficial o nada; enseña el comando exacto antes de ejecutarlo; la clave real nunca va en
`.mcp.json` (va `${VARIABLE}`, con el valor en `.env.local`). Procedimiento en `/mcp-setup`.

## Límites de ejecución

1. **Todo se prueba en local.** Nunca contra staging ni producción. Si la app no está levantada
   en local, el veredicto es "no verificado".
2. **Desplegar no es tuyo.** Prepáralo y explícalo; el botón lo pulsa una persona. Una
   autorización puntual no se hereda a la siguiente vez.
3. **Los secretos no se imprimen ni van por línea de comandos.** Ni completos ni recortados.
   Refiérete a ellos por el nombre de su variable.
4. **Nada destructivo sin confirmación.** Borrar archivos o ramas, reescribir historial, tirar
   migraciones, vaciar tablas: se pregunta antes con el alcance exacto. Antes de sobrescribir
   algo, míralo.

## Qué no hacer

- No dar por hecho lo que no has ejecutado. Si no has visto pasar el build o los tests, di que no
  los has ejecutado.
- No desactivar, saltar ni vaciar de aserciones un test para que deje de fallar.
- No meter procedimientos en este archivo ni crear `.claude/commands/`. Un procedimiento nuevo es
  una skill con una `description` que diga qué hace y cuándo usarla.
- No escribir claves reales en ningún archivo que se commitee.

---

## Proyecto

**Nombre:** _(pendiente: se rellena en /empezar)_
**Descripción:** _(pendiente: una frase)_
**Estado:** _(pendiente: En desarrollo / Beta / Producción)_

### Stack

- Framework: _(pendiente)_
- Base de datos: _(pendiente)_
- Estilos: _(pendiente)_
- Despliegue: _(pendiente)_
- Otras integraciones: _(pendiente)_

### Estructura de carpetas

_(pendiente: se documenta cuando exista código; una línea por carpeta)_

### Convenciones

- Gestor de paquetes: _(pendiente: npm / pnpm, se decide en /empezar)_
- Idioma de código y comentarios: _(pendiente)_
- Nombrado de archivos y componentes: _(pendiente)_

### Qué no hacer en este proyecto

_(pendiente: antipatrones propios del stack elegido, se añaden al rellenar architecture.md)_

### Notas

_(pendiente: comandos de desarrollo, peculiaridades del entorno)_

**Plantilla:** tecnica 1.0, validada con Claude Code 2.1.59 el 2026-11-04. Lo que da por supuesto
de las herramientas está en `.claude/SUPUESTOS.md`; `/revisar-herramientas` lo comprueba.
