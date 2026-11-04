---
name: documentacion
description: Decide qué documentos de docs/ necesita el proyecto según su tamaño (sitio pequeño, producto, producto con negocio), en qué orden se rellenan y cuáles se borran. Úsala al empezar, cuando docs/ tenga pendientes y cuando el proyecto crezca (gana cuentas de usuario, empieza a cobrar).
---

`docs/` trae dos documentos obligatorios (`prd.md`, `architecture.md`) y seis más que **solo
algunos proyectos necesitan**. Pedirlos siempre es la forma más rápida de que el protocolo se
abandone.

## 1. Decide el tamaño y dilo

- **Sitio pequeño**: landing, portfolio, contenido. Poca lógica, sin cuentas.
- **Producto**: usuarios, estado, datos que persisten.
- **Producto con negocio**: además hay que cobrar, medir o justificar decisiones.

| Documento | Sitio pequeño | Producto | Con negocio |
|-----------|:---:|:---:|:---:|
| `prd.md` | Sí | Sí | Sí |
| `architecture.md` | Sí | Sí | Sí |
| `testing.md` | Si hay lógica | Sí | Sí |
| `design-system.md` | Recomendado | Sí | Sí |
| `data-model.md` | Si hay base de datos | Sí | Sí |
| `roadmap.md` | — | Sí | Sí |
| `user-flows.md` | — | Si hay flujos con estado | Sí |
| `business.md` | — | Si se monetiza | Sí |

Si el contenido vive en archivos (Markdown, JSON) y no hay base de datos, `data-model.md` no
aplica: los campos de cada tipo de contenido se describen en `architecture.md` → Carpetas.

## 2. Rellena en este orden

prd → business → design-system → architecture → data-model → roadmap → user-flows.
`testing.md` se ajusta cuando `architecture.md` fija el stack. Confirma cada documento con la
persona antes de pasar al siguiente. Cada funcionalidad del PRD sale con ID y criterio "Dado,
cuando, entonces" comprobable; si la persona lo da vago, pregunta hasta que el "entonces" se
pueda mirar y decir sí o no.

## 3. Los que no aplican se borran solos

No rellenes los que no aplican: `node scripts/podar-docs.mjs` borra los documentos opcionales
que siguen tal como vinieron (lo sabe por la línea `<!-- huella -->` de cada uno) y deja los que
tienen algo escrito. Ejecútalo al terminar de rellenar y di qué ha borrado. Uno con una línea
escrita se queda: o se termina o se borra a mano, con permiso.

## 4. Cuando el tamaño sube

Vuelve a la tabla, di qué tamaño tiene ahora y crea lo que falte en ese momento.
