---
name: empezar
description: Arranca un proyecto nuevo a partir de la plantilla, una sola vez. Rellena docs/ con la persona (empezando por qué quiere construir y para quién), convierte el repo en el del proyecto real (README, AGENTS.md, licencia, .env.example, MCPs, changelog), borra .plantilla/ y deja el repositorio git creado, con GitHub si la persona quiere. Úsala cuando exista .plantilla/ o cuando docs/ tenga marcadores pendientes.
---

Convierte la plantilla en el repositorio del proyecto real. Se hace una vez.

## 0. Comprueba que toca

Ejecuta `node scripts/estado.mjs`. Si no existe `.plantilla/` y `docs/` no tiene pendientes, el
proyecto ya está inicializado: dilo y para, salvo que la persona pida rehacer algo concreto.

## 1. Documentación, antes que nada

No escribas código ni inicialices todavía.

1. Pregunta: **"¿Qué quieres construir y para quién?"**
2. Con la respuesta, carga `/documentacion`: decide el tamaño del proyecto, di qué documentos
   aplican y rellénalos en el orden que indica, confirmando cada uno antes de pasar al siguiente.
   Sustituye cada `_(pendiente…)_` por contenido real; no dejes ninguno en los documentos que
   aplican. Los que no aplican no se tocan: los borra la poda del paso 3.
3. En Claude Code, esta fase va bien en modo plan: leer, preguntar, proponer, sin tocar archivos
   hasta que cada documento esté acordado.

## 2. Datos del proyecto

Pregunta solo lo que no puedas deducir de `docs/`:

- Nombre y descripción de una línea; estado (En desarrollo / Beta / Producción).
- Gestor de paquetes (npm o pnpm). Comprueba cuál hay instalado con `node -v` y `npm -v` /
  `pnpm -v` y propón el que ya esté.
- Titular y año para la licencia.
- Herramientas de test: `docs/testing.md` propone Vitest (unitarios) y Playwright (navegador).
  Confirma o cambia según el stack; los dos niveles son obligatorios en cuanto haya código.

Todo esto queda escrito en `docs/architecture.md`, `docs/testing.md` y la sección "Proyecto" de
`AGENTS.md`.

## 3. Convierte el repositorio

1. **`AGENTS.md`**: rellena la sección "Proyecto" entera (nombre, stack, estructura cuando exista,
   convenciones, qué no hacer en este proyecto). Quita el punto 2 de "Al empezar una sesión" (el
   de `.plantilla/`) y renumera. Quita la frase sobre `.plantilla/changelog/` en "Cambios y pull
   requests" y las dos líneas equivalentes al final de `.claude/skills/changelog/SKILL.md`.
2. **`README.md`**: reescríbelo entero para el producto a partir de `docs/`: qué es, qué problema
   resuelve, requisitos previos, variables (referencia a `.env.example`), instalación y arranque,
   estructura, cómo se trabaja (referencia a `AGENTS.md`) y estado.
3. **`LICENSE`**: añade `Copyright (c) <año> <titular>` como primera línea de copyright y
   conserva las dos que ya hay (son la atribución de la plantilla; la licencia MIT lo exige).
   El resto del texto no se toca.
4. **`.env.example`**: solo las variables que el stack necesita, sin valores. Se puede leer y
   escribir; los `.env` con valores están denegados.
5. **`docs/`**: `node scripts/podar-docs.mjs` borra los documentos que siguen tal como vinieron
   (los que no aplican) y retira la línea `<!-- huella -->` de los rellenos. Di cuáles se han
   ido. `docs/features/` queda solo con su README.
6. **`mejoras/backlog.md`**: déjalo listo, sin ideas inventadas.

## 4. MCPs

Con el stack decidido, pregunta qué servidores MCP quiere y con qué alcance, siguiendo el
protocolo de `AGENTS.md`. Si el stack no trae servicios con MCP, propón ninguno y sigue. Para
hacerlo aparte, `/mcp-setup`.

## 5. Cierra la plantilla

1. Enseña la lista de lo que va a desaparecer y espera confirmación: `.plantilla/` entera y esta
   skill (`.claude/skills/empezar/`). Bórralo. El hook de guardia preguntará otra vez por el
   `rm -rf`: es este mismo borrado.
2. Primera entrada de `changelog/` (tipo Configuración) con `/changelog`, y quita de
   `changelog/README.md` la mención a la plantilla.
3. Referencias en prosa que queden a `.plantilla/` o a `/empezar`:
   `grep -ril "\.plantilla\|/empezar" . --include="*.md" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=changelog`.
   Se quedan `.claude/SUPUESTOS.md` (rellena la URL del repositorio de la plantilla si la
   conoces), `/revisar-herramientas` y la nota "Plantilla:" de `AGENTS.md`. El código
   (`scripts/`, `.claude/hooks/`) no se toca: usa `.plantilla/` para saber si el proyecto está
   inicializado.
4. `node scripts/estado.mjs`: inicializado, ningún documento sin tocar y nada pendiente.

## 6. Git y GitHub

1. Si no hay repositorio (`git status` falla), `git init` y un único commit con todo
   (`Arranque del proyecto <nombre>`). El historial empieza sin restos de plantilla.
2. Pregunta si quiere el repositorio en GitHub ahora. Si sí: `gh auth status`; si no está
   conectado, `gh auth login` y espera. Enseña el comando exacto
   (`gh repo create <nombre> --private --source=. --push`), con su visto bueno ejecútalo y
   comprueba con `gh repo view`. Si no: anótalo en "Notas" de `AGENTS.md` y sigue; se sube
   cuando quiera con ese mismo comando.

**Al terminar**, ningún archivo del repo se describe como plantilla. Resume qué ha cambiado y
pregunta: "¿Empezamos a construir?"
