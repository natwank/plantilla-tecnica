# Fichas de feature

**Cuándo se consulta:** al empezar cualquier sesión (para saber qué hay a medias) y antes de
escribir código. **Cuándo se actualiza:** en el momento en que un requisito cambia de estado, no
al final.

Una feature es lo que se acuerda, se construye y se cierra de una vez. Su ficha es el acuerdo
escrito antes de empezar: qué podrá hacer el usuario, cómo se enseñará cada parte, con qué se
validará y qué queda fuera. Esta carpeta empieza vacía; `/feature` crea una ficha por feature en
`docs/features/nombre-en-kebab-case.md`.

## Cuándo hace falta

Cuando el trabajo cierra requisitos del PRD, toca varias capas o archivos, o dura más de una
sesión. Un arreglo puntual, un cambio de texto o de estilos no necesita ficha: basta el changelog.

## Formato

```markdown
# Registro con email

**Estado:** Acordada
**Requisitos:** M-01, M-02
**Acordada el:** 2026-11-04
**Pull request:** _(al cerrar)_

## Qué podrá hacer el usuario

Dos o tres párrafos, sin detalle técnico. Lo que verá y hará cuando esto exista.

## Decisiones

- Una línea por decisión que no se deduce del código, con su motivo. Si afecta a la
  arquitectura o a los datos, se lleva a `docs/` en la misma sesión.

## Revisión QA

2026-11-04, revisor con contexto limpio, 3 hallazgos:
1. "contraseña válida" no decía cuántos caracteres → corregido en el PRD (8+).
2. No había caso para email ya registrado → añadido como criterio negativo de M-01.
3. ¿Qué pasa si falla el envío del correo? → decisión: se muestra aviso y se reintenta; fuera
   de esta feature el reintento automático.

## Plan

### 1. M-01 Registro con email — Pendiente

- **Se construye en:** `src/app/registro/`, `src/lib/auth.ts`
- **Cómo se enseña:** abrir `/registro`, enviar `prueba@ejemplo.com` y una contraseña de 8
  caracteres; aparece el panel vacío con el saludo "Hola, prueba". Con un email ya registrado,
  aparece el error junto al campo y no se crea cuenta.
- **Se valida con:** navegador: `e2e/registro.spec.ts`

### 2. M-02 Confirmación por correo — Pendiente

- **Se construye en:** `src/lib/email.ts`
- **Cómo se enseña:** registrarse; en la bandeja de pruebas llega un correo con el enlace;
  al abrirlo, el panel muestra "Cuenta confirmada".
- **Se valida con:** unitario: `tests/email.test.ts` · navegador: `e2e/confirmacion.spec.ts`

## Fuera de esta feature

- Inicio de sesión con Google: va a `mejoras/`.
```

## El plan es el contrato

Cada requisito es un bloque con **su propio estado**, y se construye en orden:

| Estado del requisito | Significa |
|----------------------|-----------|
| **Pendiente** | Acordado, sin código |
| **Construida** | Implementado, enseñado a la persona siguiendo "Cómo se enseña", y con su visto bueno |
| **Validada** | Su test existe y pasa, o su revisión humana está hecha y anotada |

El estado de la ficha se deriva: **Acordada** cuando todo está Pendiente; **En construcción**
en cuanto se empieza; **Verificada** cuando todo está Validada. Una sesión nueva lee la ficha y
sabe en qué requisito se quedó.

Tres campos por requisito, los tres obligatorios:

- **Se construye en:** archivos o carpetas. Al cerrar, tienen que existir.
- **Cómo se enseña:** qué abrir, qué hacer y qué tiene que aparecer, de forma que cualquiera
  pueda repetirlo sin saber programar. Es lo que el agente hace delante de la persona al
  terminar el bloque, y lo que después copia el test de navegador.
- **Se valida con:** una de cuatro formas, con el tipo delante:
  - `unitario: tests/archivo.test.ts` para lógica, cálculos, transformaciones.
  - `navegador: e2e/archivo.spec.ts` para lo que ve y hace el usuario. Un requisito con
    pantalla lleva siempre uno.
  - `revisión humana: <qué se mira>; <qué tiene que verse>` para lo que se comprueba mejor con
    los ojos (cómo se ve, cómo suena) y un test cubriría mal.
  - `sin interfaz: <por qué no hay test ni pantalla>; <cómo se comprueba entonces>` para un
    índice, una variable de entorno, una configuración.
  Varias formas se separan con ` · `. Si no sabes cuál poner, pregunta.

Lo que no tiene forma de comprobarse no se decide: se escurre, y nadie lo echa de menos hasta
que falla en producción. Obligar a escribirlo convierte una omisión invisible en una frase que
se puede leer y discutir.

## Se comprueba sola

`node scripts/verificar-cobertura.mjs` corre al editar una ficha (hook), antes de cerrar y en CI
con cada pull request. Comprueba:

- Cabecera completa y estados válidos; la ficha Verificada solo si todos los requisitos están
  Validada; Acordada solo si todos están Pendiente.
- Que cada ID de `Requisitos` tenga bloque y exista en el PRD con su "dado, cuando, entonces".
- Que los tres campos estén y "Cómo se enseña" diga algo que se pueda repetir.
- Que "Se valida con" tenga una de las cuatro formas, completas.
- En un requisito Validada: que sus tests existan, apunten dentro del repositorio y tengan al
  menos una aserción, y que lo que dice "Se construye en" exista.
- Que una ficha En construcción no lleve semanas sin tocarse.

Es estructural: detecta la promesa incumplida, no el test que comprueba poco ni la revisión que
no se hizo. Por eso el PR declara la evidencia por requisito.
