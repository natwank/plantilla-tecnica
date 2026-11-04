# Plantilla técnica

Plantilla para empezar proyectos con agentes de código (Claude Code, Codex, Cursor) sin que se
pongan a escribir antes de entender qué se construye. Para quien ya ha trabajado con
repositorios, terminal y agentes. Hay una versión [paso a paso](https://github.com/natwank/plantilla-paso-a-paso) para quien
empieza de cero; el protocolo es el mismo.

## El protocolo en seis líneas

1. **Toda sesión empieza leyendo el estado.** Un hook lo imprime al arrancar; si hay documentos
   sin rellenar, el agente pregunta antes de actuar.
2. **Cada funcionalidad del PRD lleva ID y criterio comprobable** ("Dado, cuando, entonces").
3. **Cada feature empieza por su ficha** en `docs/features/`: un plan con un bloque por
   requisito que dice dónde se construye, cómo se enseña y con qué se valida. Un revisor QA con
   contexto limpio la revisa antes de construir. Después se construye un requisito cada vez, y
   cada uno lleva su propio estado.
4. **Ningún requisito se queda sin validación declarada**: test unitario o de navegador,
   revisión humana repetible o "sin interfaz" con su razón. Un script lo comprueba al editar la
   ficha, al cerrar y en cada PR; y mira dentro de los tests.
5. **Cada cambio deja changelog y docs al día** en la misma sesión.
6. **El PR se cierra con evidencia**, no con casillas.

## Qué hay dentro

| Ruta | Qué es |
|------|--------|
| `AGENTS.md` | Contrato para cualquier agente: reglas, no procedimientos. Menos de 150 líneas |
| `CLAUDE.md` | Importa `AGENTS.md` y añade lo propio de Claude Code (modo plan, subagente, hooks) |
| `.claude/settings.json` | Permisos: lo seguro sin preguntar, lo sensible siempre, `.env*` denegado. Hooks |
| `.claude/hooks/` | Cuatro guardas: sin ficha no hay código, sin changelog no hay commit, nada destructivo sin preguntar, verificador al editar una ficha |
| `.claude/SUPUESTOS.md` | Lo que la plantilla asume de las herramientas y cómo comprobarlo |
| `.claude/agents/revisor-qa.md` | Subagente que revisa fichas sin el sesgo de quien las escribió |
| `.claude/skills/` | `/empezar`, `/documentacion`, `/feature`, `/cerrar`, `/changelog`, `/mejora`, `/diagnostico`, `/mcp-setup`, `/revisar-herramientas` |
| `docs/` | Dos documentos obligatorios (`prd`, `architecture`) y hasta seis más según el proyecto. Los que nadie toca se borran solos |
| `docs/features/` | Una ficha por feature. Llega vacía |
| `changelog/`, `mejoras/` | Registro de cambios e ideas aparcadas. Llegan vacíos |
| `scripts/` | `estado.mjs` (estado en diez líneas), `verificar-cobertura.mjs` (la regla, ejecutable) y `comprobar-mecanismos.mjs` (los hooks responden) |
| `.github/` | Workflow de cobertura, plantilla de PR con evidencia, plantillas de issue |
| `.plantilla/` | Decisiones de diseño e historial de la plantilla. Se borra al inicializar |

## Cómo empezar

1. Usa la plantilla en GitHub o clónala.
2. Abre la carpeta con tu agente. Con Claude Code, el hook de arranque dirá que el proyecto no
   está inicializado y el agente cargará `/empezar`; con Codex, pídele que siga `AGENTS.md`.
3. Responde a "¿qué quieres construir y para quién?" y ve confirmando los documentos uno a uno.
4. `/empezar` reescribe este README para tu producto, rellena `AGENTS.md`, crea el repositorio
   y borra `.plantilla/`. A partir de ahí: `/feature` → construir → `/cerrar`.

## Se mantiene al día

`.claude/SUPUESTOS.md` lista lo que la plantilla asume de Claude Code, Codex y GitHub, y cómo
comprobarlo. `/revisar-herramientas` compara la versión instalada con la validada, lee el
changelog oficial entre ambas, ejecuta `scripts/comprobar-mecanismos.mjs` y propone cambios uno a
uno. Sobrevive a la inicialización: es del proyecto, no de la plantilla.

## Por qué está hecha así

[`.plantilla/DECISIONES.md`](.plantilla/DECISIONES.md): qué se carga en cada sesión, qué es una
skill y qué no, por qué la revisión la hace otro contexto, qué va en un hook, qué funciona con
Claude Code y qué con Codex.

## Convenciones

El gestor de paquetes (npm o pnpm), el idioma y el nombrado se deciden en `/empezar` y quedan en
`AGENTS.md`. Los scripts de la plantilla son Node sin dependencias.

## Licencia

MIT © 2026 Natalia Crespo. Derivada de [project-template](https://github.com/polmarza/project-template)
de Pol Marzà (MIT). Ver [`LICENSE`](./LICENSE).
