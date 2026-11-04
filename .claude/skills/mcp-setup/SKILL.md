---
name: mcp-setup
description: Configura los servidores MCP del proyecto según el stack de docs/architecture.md, preguntando alcance (user/project/local) y credenciales, y comprobando la fuente oficial de cada servidor. Úsala al cerrar docs/architecture.md o cuando entre una integración nueva (Supabase, Stripe, Vercel, Resend, Sentry…).
---

Sigue el apartado "Servidores MCP" de `AGENTS.md`: pregunta, no instales por tu cuenta.

## 1. Contexto

Lee `docs/architecture.md`; sin stack definido, para aquí. `claude mcp list` para ver qué hay.

## 2. Qué existe

Por cada servicio del stack, averigua si publica servidor MCP. **Si no estás seguro del nombre
del paquete, del transporte o de las credenciales, búscalo en la documentación o el repositorio
oficial del proveedor.** Un blog, un agregador o un gist no valen para un comando que se va a
ejecutar en la máquina de la persona: un paquete con el nombre mal escrito se ejecuta con `npx`
igual que el bueno. Si solo lo encuentras en fuentes no oficiales, dilo y que decida.

## 3. Pregunta alcance

| Alcance | Dónde vive | Quién lo ve | Cuándo |
|---------|-----------|-------------|--------|
| `user` | `~/.claude.json` | Solo esta persona, en todos sus proyectos | Ya lo tiene o lo usa en todas partes |
| `project` | `.mcp.json` commiteado | Todo el equipo | Recomendado: forma parte del proyecto |
| `local` | `~/.claude.json`, bajo este proyecto | Solo esta persona, solo aquí | Pruebas o credenciales que no quiere ni referenciadas |

La cuarta opción es **ninguno**. Precedencia: local → project → user; avisa si uno nuevo pisa a
otro ya configurado.

## 4. Configura

1. Pide las credenciales por su nombre exacto de variable, una a una. Con OAuth no pidas nada:
   añade el servidor y que la persona ejecute `/mcp` para autenticarse.
2. Enseña el comando exacto y su procedencia; con el visto bueno, ejecútalo:
   `claude mcp add --transport http <nombre> --scope project <url>` o
   `claude mcp add --transport stdio <nombre> --scope project -- npx -y <paquete>`.
   Si la documentación pide más (scripts de setup, exportar tokens), párate y pregunta.
3. En `.mcp.json` la credencial va como `${VARIABLE}`; el valor en `.env.local`; la variable
   vacía en `.env.example`.
4. `claude mcp list` para comprobar que arranca.

## 5. Cierra

Documenta el servidor en `docs/architecture.md` → "MCPs del proyecto" y registra el cambio con
`/changelog` (Configuración). Los servidores de alcance `project` piden aprobación la primera
vez que alguien abre el repo.
