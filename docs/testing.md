# Cómo se demuestra que funciona

**Cuándo se consulta:** al rellenar "Se valida con" en una ficha y al escribir tests.
**Cuándo se actualiza:** cuando cambian las herramientas o las convenciones.

## Dos niveles, siempre

| Nivel | Qué cubre | Herramienta | Dónde |
|-------|-----------|-------------|-------|
| Unitario | Lógica, cálculos, transformaciones, componentes con estado | _(pendiente: Vitest propuesto)_ | `tests/*.test.ts` |
| Navegador | Lo que ve y hace la persona: pantallas, formularios, flujos | _(pendiente: Playwright propuesto)_ | `e2e/*.spec.ts` |

Un requisito con pantalla lleva test de navegador; uno de lógica, unitario. La revisión humana
queda para lo que ninguno cubre bien (cómo se ve, cómo suena). "Sin interfaz" para lo que no
tiene ni pantalla ni test (un índice, una variable). El verificador exige una de las cuatro.

## Cuándo se escriben

**Después de implementar, leyendo el código real.** El compromiso se adquiere antes, en la ficha;
el test se escribe cuando el código existe. Un test escrito antes apunta a selectores y rutas
imaginados, y cuando no coinciden casi nadie lo reescribe: se le quitan aserciones hasta que pasa.

El test de navegador reproduce "Cómo se enseña" de la ficha: abre lo mismo, hace lo mismo y
comprueba que aparece lo mismo. Si no se puede escribir así, "Cómo se enseña" estaba mal escrito.

## Reglas

- Antes de una aserción, comprueba que el selector existe. Si no hay selector estable, añade un
  `data-testid`: es preferible a colgar el test de una clase de estilos o de un texto.
- Cada "entonces" del criterio tiene al menos una aserción. El caso de fallo lleva su test.
- Un test que falla no se arregla quitándole aserciones: o el código está mal o el criterio lo
  estaba, y se corrige donde toca.
- Los datos que crea un test los borra ese test, aunque falle a mitad. Prefijo: _(pendiente)_.
- Un test vacío no cuenta: el verificador busca aserciones dentro.

## Qué no se testea

_(pendiente: lo puramente visual (va a revisión humana), los servicios de terceros (se simulan),
lo que cambia cada semana)_

## Cómo se ejecutan

```bash
_(pendiente: unitarios)_
_(pendiente: navegador; qué tiene que estar levantado antes)_
```

Se ejecutan siempre contra local. Nunca contra producción.

<!-- huella: a198429eed64 · plantilla sin tocar; scripts/podar-docs.mjs la usa -->
