# CLAUDE.md

@AGENTS.md

## Específico de Claude Code

Las instrucciones del proyecto están en `AGENTS.md`. Aquí va solo lo que aplica a Claude Code.

- **Modo plan para acordar.** La fase "Acordar" de una feature se hace en modo plan: lee, pregunta
  y propón sin tocar archivos. La ficha se escribe cuando el plan está aceptado.
- **El revisor QA es un subagente** (`.claude/agents/revisor-qa.md`). `/feature` lo lanza con la
  ficha y el PRD; no revises tú mismo lo que acabas de redactar.
- **Hooks.** Al arrancar se imprime el estado del proyecto. Antes de escribir código sin ficha
  En construcción, antes de un commit sin changelog y antes de un comando destructivo, se
  pregunta. Al editar una ficha, corre el verificador. No los desactives para avanzar más
  rápido: si uno pregunta, es que el protocolo tiene algo que decir.
- **Una conversación por feature.** La ficha guarda el estado; una sesión nueva lo recupera.
  Usa `/compact` solo para conservar una conversación en curso.
- **Memoria automática.** Es personal y local. Lo que deba sobrevivir a otra máquina u otra
  herramienta va en `docs/`, en la ficha o en el changelog.
- `.claude/settings.local.json` es para preferencias personales y no se commitea.
