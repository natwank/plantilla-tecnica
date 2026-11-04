# Lo que esta plantilla da por supuesto de las herramientas

Cada mecanismo de la plantilla apoya en algo que hoy hacen Claude Code o Codex. Las herramientas
cambian; esta tabla dice **qué se asume, dónde se usa y cómo comprobar que sigue siendo cierto**.
`/revisar-herramientas` la recorre cuando la versión instalada es más nueva que la validada.

**Validada con:** Claude Code 2.1.59 · Node 23 · gh 2.96 · 2026-11-04.
**Repositorio de la plantilla:** https://github.com/natwank/plantilla-tecnica

| # | Supuesto | Dónde se usa | Cómo comprobarlo |
|---|----------|--------------|------------------|
| 1 | `CLAUDE.md` se carga en cada sesión e importa archivos con `@ruta` | `CLAUDE.md` → `@AGENTS.md` | Pedir al agente que cite una regla de `AGENTS.md` sin abrirlo |
| 2 | Codex lee `AGENTS.md` de serie | `AGENTS.md` | Abrir el proyecto con Codex y pedir lo mismo |
| 3 | `.claude/settings.json` admite `permissions.allow` y `permissions.deny` con patrones `Bash(...)` y `Read(...)` | `settings.json` | `git status` pasa sin preguntar; leer `.env.local` se deniega |
| 4 | Existen los eventos de hook `SessionStart`, `PreToolUse` y `PostToolUse`, con `matcher` por nombre de herramienta | `settings.json` → `hooks` | Al arrancar aparece "Estado del proyecto"; editar una ficha rota devuelve fallos |
| 5 | Un hook recibe la llamada por stdin como JSON con `tool_name` y `tool_input` (`command`, `file_path`) | `.claude/hooks/*.mjs` | `node scripts/comprobar-mecanismos.mjs` |
| 6 | Un hook `PreToolUse` puede responder `permissionDecision: "ask"` con `permissionDecisionReason` | `guardia`, `ficha-antes-de-codigo`, `changelog-antes-de-commit` | Un `git push --force` pide confirmación con el motivo |
| 7 | Un hook `PostToolUse` que sale con código 2 entrega su stderr al agente | `verificar-tras-editar-ficha` | Editar una ficha dejando un requisito sin "Se valida con": el agente recibe el fallo |
| 8 | Los hooks disponen de `$CLAUDE_PROJECT_DIR` | `settings.json` | Los hooks arrancan desde cualquier subcarpeta |
| 9 | La salida de un hook `SessionStart` entra en el contexto | `scripts/estado.mjs` | El agente sabe el estado sin que nadie se lo pida |
| 10 | Las skills viven en `.claude/skills/<nombre>/SKILL.md` con `name`, `description` y `argument-hint`, se lanzan con `/nombre` y el agente las carga por su `description` | `.claude/skills/` | `/feature` responde; pedir "registra este cambio" carga `/changelog` sola |
| 11 | Los subagentes viven en `.claude/agents/<nombre>.md` con `name`, `description` y `tools` | `revisor-qa` | `/feature` lanza el revisor y devuelve la lista numerada |
| 12 | Existe modo plan (leer y proponer sin tocar archivos) | `CLAUDE.md`, `/feature`, `/empezar` | Activarlo en la fase de acuerdo |
| 13 | Existe `/security-review` | `AGENTS.md`, `/cerrar` | Lanzarlo |
| 14 | `claude mcp add --transport <http|stdio> <nombre> --scope <user|project|local>` y `claude mcp list`; `.mcp.json` expande `${VAR}` | `/mcp-setup`, `/diagnostico` | `claude mcp list` |
| 15 | `.claude/settings.local.json` es personal y se ignora en git | `.gitignore`, `CLAUDE.md` | Existe tras una preferencia personal y no aparece en `git status` |
| 16 | `gh repo create --private --source=. --push`, `gh pr create`, `gh pr checks`, `gh auth login` | `/empezar`, `/cerrar` | `gh --version`; crear un repo de prueba |
| 17 | Las GitHub Actions `actions/checkout@v4` y `actions/setup-node@v4` siguen vigentes | `.github/workflows/cobertura.yml` | El workflow pasa en un PR |
| 18 | Los documentos de `docs/` conservan su línea `<!-- huella: … -->` hasta que alguien los rellena (ningún formateador la quita) | `scripts/podar-docs.mjs`, `estado.mjs` | `node scripts/podar-docs.mjs --comprobar` en una copia intacta lista seis documentos |

## Qué no se asume

- Ninguna función que no esté en la documentación oficial de la herramienta.
- Que un hook o una skill funcione igual en Codex: ahí las reglas se cumplen por instrucción.
