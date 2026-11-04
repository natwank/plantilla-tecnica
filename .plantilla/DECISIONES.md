# Por qué la plantilla es como es

Este documento recoge las decisiones de diseño de la plantilla y el motivo de cada una. Casi
todas salen de cómo funcionan hoy los agentes de código (Claude Code y Codex) y de qué cuesta
contexto, qué se carga cuándo y qué puede olvidar un modelo y qué no.

Origen: la plantilla parte de `project-template` de Pol Marzà (MIT, 2026). Conserva su protocolo
(documentar antes de construir, ficha por feature, tabla de cobertura verificada por script,
changelog, PR con evidencia) y cambia la forma de encajarlo en el agente.

---

## 1. Lo que se carga en cada sesión tiene que ser corto

`AGENTS.md` (y `CLAUDE.md`, que lo importa) entra en el contexto **de todas las conversaciones**,
desde el primer mensaje. Cada línea que hay ahí se paga en cada turno y compite con el código y
los documentos que el agente necesita leer para trabajar.

Por eso:

- `AGENTS.md` lleva **reglas, no procedimientos**, y no pasa de 150 líneas.
- Los procedimientos (cómo se crea una ficha, cómo se registra un cambio, cómo se configura un
  MCP) viven en skills, que se cargan **solo cuando hacen falta**.
- Los ejemplos largos y las explicaciones viven en `docs/` o en el README de cada carpeta.
- Los datos del proyecto (nombre, stack, convenciones) sí van en `AGENTS.md`, porque se necesitan
  siempre. Pero van como texto visible con marcador `_(pendiente)_`, no dentro de comentarios
  HTML: un comentario es algo que el agente aprende a ignorar, y un marcador visible es algo que
  ve y rellena.

## 2. Una skill es un procedimiento con nombre

Las skills de `.claude/skills/<nombre>/SKILL.md` tienen dos entradas: la persona las lanza con
`/nombre`, o Claude Code las carga por su cuenta cuando lo que se está haciendo encaja con la
`description` de la cabecera. Esa `description` es, en la práctica, la condición de disparo: dice
qué hace la skill **y cuándo usarla**, y se escribe con ese cuidado.

Lo que NO es una skill:

- Lo que el agente ya hace de serie: deshacer cambios (checkpoints y `Esc Esc` en Claude Code),
  revisar seguridad (`/security-review`), planificar antes de tocar código (modo plan), resumir
  el contexto (`/compact`), gestionar servidores MCP (`/mcp`). Para eso no se escribe nada.
- Una regla. "No imprimas secretos" no es un procedimiento, es una regla, y va en `AGENTS.md`.

Cada skill se mantiene corta (menos de 100 líneas). Una skill larga es una señal de que mezcla
dos procedimientos o de que lleva explicaciones que deberían estar en un documento.

`.claude/commands/` es el formato anterior y no se usa.

## 3. La revisión de una ficha la hace otro contexto

Cuando el mismo agente escribe una ficha y después la revisa, la defiende: ya ha decidido lo que
significa cada frase y no ve la ambigüedad. La revisión como QA (ambigüedades, contradicciones,
casos límite) la hace un **subagente** definido en `.claude/agents/revisor-qa.md`, que arranca
con contexto limpio, lee la ficha y el PRD como si fuera la primera vez, y devuelve una lista
numerada sin proponer soluciones. Es el mismo paso que hacía la skill `/feature` de la plantilla
original, pero sin el sesgo de quien redactó.

Con Codex, que no tiene este mecanismo, la skill indica que se haga la revisión en una
conversación nueva.

## 4. Lo que no puede depender de que el modelo se acuerde va en un hook

Un modelo puede olvidar una regla en el turno cuarenta. Un hook no. Claude Code ejecuta los hooks
de `.claude/settings.json` de forma determinista, y aquí se usan cinco:

- **`SessionStart`** ejecuta `scripts/estado.mjs` y mete su salida en el contexto: si el proyecto
  está inicializado, qué documentos tienen contenido, qué fichas están a medias y cuál fue el
  último cambio registrado. El agente empieza cada sesión sabiendo dónde está sin tener que leer
  el repositorio entero, y sin que nadie tenga que acordarse de pedírselo.
- **`PreToolUse` sobre Bash** ejecuta `.claude/hooks/guardia.mjs`: si el comando es destructivo
  (`rm -rf`, `git push --force`, `git reset --hard`, borrar ramas, vaciar tablas), convierte la
  ejecución en una pregunta a la persona aunque los permisos la permitieran. Es la regla "nada
  destructivo sin confirmación" convertida en mecanismo.
- **`PreToolUse` sobre Bash** también ejecuta `changelog-antes-de-commit.mjs`: un `git commit`
  que toca código sin una entrada nueva en `changelog/` se convierte en pregunta.
- **`PreToolUse` sobre Write/Edit** ejecuta `ficha-antes-de-codigo.mjs`: escribir código sin una
  ficha En construcción (o con `.plantilla/` todavía presente) se convierte en pregunta.
- **`PostToolUse` sobre Write/Edit** ejecuta `verificar-tras-editar-ficha.mjs`: al guardar una
  ficha corre el verificador y, si falla, el agente recibe los fallos en el acto.

Los hooks son de Claude Code. Con Codex las reglas siguen escritas en `AGENTS.md` y se cumplen
por instrucción; el proyecto funciona igual, con una red de seguridad menos.

## 5. Permisos: lo seguro sin preguntar, lo sensible siempre, los secretos nunca

`.claude/settings.json` permite sin preguntar lo que no puede romper nada (leer, buscar, `git
status`, `git diff`, `git log`, los comandos de instalación y de tests del proyecto, crear
commits y ramas) para que el agente no interrumpa cada dos pasos. Todo lo demás pregunta.

Y **deniega leer `.env` y `.env.*`**. El agente no necesita el valor de una clave para trabajar:
necesita saber que existe, y eso lo da `.env.example`. Denegarlo evita el accidente más común:
que una clave acabe en una conversación, en un log o en un PR.

## 6. Modo plan es el "acordar" del protocolo

El ciclo de una feature empieza por acordar qué se construye. Claude Code tiene un modo plan en
el que el agente lee, pregunta y propone sin tocar archivos. La plantilla lo nombra en `CLAUDE.md`
para que la fase de acuerdo se haga ahí: la ficha se escribe cuando el plan está aceptado, no
antes.

## 7. La memoria automática no sustituye a `docs/`

Claude Code guarda memoria por proyecto en la máquina de cada persona. Es útil, pero es
**personal y local**: no viaja con el repositorio, no la ve el equipo ni la ve Codex. Todo lo que
tenga que sobrevivir a un cambio de máquina o de herramienta va en `docs/`, en las fichas y en el
changelog. La memoria automática queda para preferencias personales.

## 8. El gestor de paquetes no viene fijado

La plantilla original imponía pnpm. Aquí se decide en `/empezar` y se anota en `AGENTS.md`. Los
permisos cubren npm y pnpm, y los scripts de la plantilla no dependen de ninguno (Node sin
dependencias).

## 9. Una sesión por feature

El contexto de una conversación se degrada cuando crece. La ficha de feature existe precisamente
para que no haga falta mantener una conversación larga: cada fila de la tabla de cobertura se
construye, se enseña y se registra; una sesión nueva lee la ficha y sabe por dónde seguir. La
recomendación es empezar conversación nueva por feature, y `/compact` solo cuando se quiere
conservar una conversación en curso.

## 10. Lo que vale para los dos agentes y lo que no

| Pieza | Claude Code | Codex |
|-------|-------------|-------|
| `AGENTS.md` | Lo carga `CLAUDE.md` con `@AGENTS.md` | Lo lee de serie |
| Skills (`.claude/skills/`) | Las lanza y las carga solo | Las abre como archivo cuando `AGENTS.md` las nombra |
| Subagente revisor | Nativo | Se sustituye por una conversación nueva |
| Hooks (cinco guardas) | Nativos | No existen: las reglas se cumplen por instrucción |
| Permisos de `settings.json` | Nativos | Los gestiona Codex con su propia configuración |
| `scripts/` y `.github/` | Iguales | Iguales |

El protocolo (documentos, fichas, tabla de cobertura, changelog, PR con evidencia) es idéntico
con las dos herramientas. Lo que cambia es cuántas reglas tienen mecanismo detrás.

## 11. Dos niveles de test, y el verificador mira dentro

La tabla de cobertura exige validación por requisito; la plantilla original dejaba el tipo de
test a cada proyecto. Aquí `docs/testing.md` fija dos niveles desde el principio (unitario para
la lógica, navegador para lo que ve el usuario; Vitest y Playwright como propuesta) y la ficha
asigna el tipo según el requisito. `/cerrar` ejecuta los dos.

El verificador se reescribió: además de lo que comprobaba el original (tercera columna, IDs,
rutas, existencia en Verificada), exige que los criterios del PRD lleven "dado, cuando,
entonces", que un test prometido tenga al menos una aserción (un archivo vacío ya no pasa), que
lo que dice "Se implementa en" exista al cerrar, y avisa de fichas En construcción olvidadas.

## 12. La plantilla sabe qué da por supuesto

Nada de lo anterior sobrevive a un cambio de formato en los hooks o en las skills. Como no se
puede saber qué cambiará, la plantilla hace lo siguiente mejor: `.claude/SUPUESTOS.md` lista
cada cosa que asume de las herramientas, dónde la usa y cómo comprobarla; `AGENTS.md` anota con
qué versión se validó; `scripts/comprobar-mecanismos.mjs` prueba que los hooks responden; y
`/revisar-herramientas` compara versiones, lee el changelog oficial entre ambas, contrasta la
tabla, compara los mecanismos con la última versión de la plantilla madre y propone cambios con
su fuente. Lo que garantiza es que la pregunta "¿sigue siendo cierto?" se haga; responderla es
criterio de cada momento.

## 13. La ficha es un plan por requisito, no una tabla

La ficha original llevaba una tabla de tres columnas y un único estado para toda la feature.
Funcionaba para quien programa; no decía en qué requisito se había quedado una sesión, ni cómo
enseñar cada parte a alguien que no sabe leer un test. La ficha de esta plantilla es un **plan**:
un bloque por requisito, en orden de construcción, con su propio estado (Pendiente, Construida,
Validada) y tres campos:

- **Se construye en**: archivos. Al cerrar, tienen que existir.
- **Cómo se enseña**: qué abrir, qué hacer y qué tiene que aparecer. Es lo que el agente hace
  delante de la persona al terminar el bloque, lo que una persona sin conocimientos técnicos
  puede repetir, y el guion del test de navegador. Si no se puede escribir, el requisito no está
  claro.
- **Se valida con**: con el tipo delante (`unitario:`, `navegador:`, `revisión humana:`, `sin
  interfaz:`), para que el verificador exija lo que corresponde a cada uno sin adivinarlo por la
  ruta.

El estado de la ficha se deriva del de sus requisitos y el verificador comprueba que concuerden.
`estado.mjs` dice "2/4 validados, siguiente M-03": una sesión nueva sabe por dónde seguir sin
leer la conversación anterior. La sección "Revisión QA" guarda los hallazgos del revisor y cómo
se cerró cada uno, para que la ficha cuente también lo que se discutió.

## 14. Cada documento dice cuándo se lee

Un agente no relee `docs/` entero en cada turno; abre un documento cuando algo se lo recuerda.
Por eso cada documento empieza con dos líneas: **cuándo se consulta** (antes de una migración,
antes de crear un componente, al escribir un test de navegador) y **cuándo se actualiza**. Son
disparadores, no decoración: es lo que hace que `data-model.md` se abra antes de la migración y
no después. Los documentos también se han reescrito con los nombres de lo que contienen ("Con
qué se construye", "Cómo se demuestra que funciona") y con lo que faltaba para trabajar con un
agente: cómo se arranca en local, quién publica y con qué, datos de prueba, costes mensuales.

El changelog gana "Qué cambia para la persona que usa el producto" y "Cómo se comprobó"; el PR,
un bloque de evidencia por requisito. Las tres piezas (ficha, changelog, PR) hablan ahora el
mismo idioma: requisito, cómo se enseña, con qué se valida.

## 15. Dos plantillas, un núcleo

Hay dos versiones de la plantilla y comparten todo lo anterior:

- **`tecnica/`** para quien ya ha trabajado con repositorios, terminal y agentes: va al grano.
- **`paso-a-paso/`** para quien empieza de cero: el mismo protocolo entero, más una capa de
  acompañamiento. Un perfil de la persona en `AGENTS.md` dice qué conoce y qué no; el agente
  explica cada concepto la primera vez (con `GLOSARIO.md` como fuente), pregunta si ha quedado
  claro y lo anota para no repetirlo. Una guía de instalación cubre lo que la persona tiene que
  hacer con sus manos (cuentas, instalar la app) y el agente hace el resto explicando.

Cuando cambie el núcleo, se cambia en las dos.

## 16. Los documentos que no se usan se borran solos

Dos documentos son obligatorios (`prd.md`, `architecture.md`); los otros seis dependen del
proyecto. Dejar un documento sin rellenar es peor que no tenerlo: el estado de arranque lo
reclama en cada sesión hasta que alguien lo rellena por cumplir, y a partir de ahí el protocolo
se abandona. Pedir al agente que "borre los que no aplican" tampoco bastaba: es un paso que se
olvida.

Por eso cada documento de `docs/` termina con una línea `<!-- huella: … -->` con el resumen de su
propio contenido tal como vino. `scripts/podar-docs.mjs` borra los opcionales cuyo contenido
sigue dando esa huella, y solo esos: una palabra cambiada y el documento se queda. Así nunca se
pierde nada escrito y no hay que preguntar. Corre en `/empezar`, en `/cerrar` y en CI con
`--comprobar`, donde impide que un documento intacto llegue a `main`. La huella viaja dentro del
documento, así que la regla sigue funcionando después de borrar `.plantilla/` y con documentos
que se creen más adelante a partir de la plantilla. `--sellar` regenera las huellas y solo se
usa al editar la plantilla misma.
