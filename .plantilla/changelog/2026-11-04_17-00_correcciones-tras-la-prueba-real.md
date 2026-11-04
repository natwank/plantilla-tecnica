# Correcciones tras la primera prueba real de /empezar

**Fecha:** 2026-11-04 17:00
**Tipo:** Fix
**Requisitos:** Ninguno (andamiaje)

## Qué se hizo

Se ejecutó `/empezar` de principio a fin en una copia de `paso-a-paso/` con un proyecto de
ejemplo (web de un taller de cerámica, persona que nunca ha programado). La skill se completó,
pero el informe de la prueba dejó quince observaciones. Se aplicaron en las dos plantillas:

- `.claude/settings.json`: la denegación `Read(./.env.*)` atrapaba `.env.example`, el único
  archivo que la skill manda editar y el agente no podía ni leer. Ahora se deniegan por nombre
  los `.env` con valores (`.env`, `.env.local`, `.env.*.local`, development, production, test,
  staging; también en `.gitignore`) y `.env.example` se lee. `git init` pasa a la lista de
  permitidos.
- `/empezar` reordenada: la plantilla se borra **antes** del primer commit, así el historial de
  cada proyecto empieza limpio con un solo commit. GitHub es el último paso y opcional, con qué
  hacer si la persona dice que no; en paso a paso ya no se exige cuenta de GitHub al preparar el
  ordenador. El grep de referencias se limita a prosa y dice qué se queda (el código usa
  `.plantilla/` para saber si el proyecto está inicializado). Texto exacto para `LICENSE`,
  "renumera", aviso de que el hook de guardia preguntará por el borrado, MCPs en una frase si el
  stack no trae ninguno.
- `scripts/podar-docs.mjs` retira la línea `<!-- huella -->` de los documentos que se quedan.
- `scripts/verificar-cobertura.mjs` acepta criterios del PRD envueltos en varias líneas y, sin
  fichas, informa de cuántos requisitos tiene el PRD.
- `scripts/estado.mjs` ya no lista como "no existen" los documentos podados una vez inicializado.
- `.claude/hooks/guardia.mjs` pregunta también ante `git rm -r`.
- `/documentacion`: `data-model.md` solo si hay base de datos; el contenido en archivos se
  describe en `architecture.md`. `/changelog` y `/diagnostico` ajustados.
- paso a paso: `GLOSARIO.md` gana Markdown, documento de arquitectura, sistema de diseño,
  documento de tests, hosting y servicio externo; comparación en Commit, GitHub, Test, PRD,
  Changelog, Stack, Base de datos, Licencia, MCP; variable de entorno ya no asume secreto; Hook
  dice cinco. `GUIA-DE-INSTALACION.md` y `README.md` dicen "GitHub si quieres".
- `DECISIONES.md` §4 lista los cinco hooks.

## Por qué

Es la primera vez que la plantilla se usa de verdad. Lo que falló no se veía leyendo: una regla
de permisos bien intencionada bloqueando un paso, un orden de pasos que deja basura en el
historial, y conceptos sin entrada en el glosario.

## Cómo se comprobó

`comprobar-mecanismos.mjs` y `verificar-cobertura.mjs` limpios en las dos plantillas. En una
copia: un PRD con un criterio en dos líneas pasa el verificador; la poda borra seis, limpia la
huella de `prd.md` y avisa del obligatorio; `estado.mjs` tras borrar `.plantilla/` no reclama los
podados; `guardia.mjs` pide confirmación ante `git rm -r .plantilla`. El informe completo de la
prueba está en `_prueba-empezar/taller-ceramica/INFORME-PRUEBA.md` (fuera de las plantillas).
