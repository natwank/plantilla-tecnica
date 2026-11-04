<!-- Lo abre el agente con la plantilla rellena. Si lo abres a mano, rellénala tú. -->

## Qué cambia

<!-- Una o dos frases, en lenguaje llano: qué puede hacer ahora la persona que no podía antes -->

## Por qué

## Requisitos

<!-- IDs del PRD (M-01, S-02) y enlace a la ficha. "Ninguno" si es un cambio interno -->

**Ficha:**

## Tipo

- [ ] Feature
- [ ] Fix
- [ ] Refactor
- [ ] Migración
- [ ] Documentación
- [ ] Configuración

## Evidencia por requisito

<!-- Un bloque por requisito, copiando "Se valida con" de la ficha. La salida real de los
     comandos, recortada a lo relevante; "los tests pasan" no es evidencia, la salida sí. Para una
     revisión humana: quién, qué miró, qué vio. Lo no ejecutado se dice, con el motivo.
     Repasa lo que pegas: sustituye cualquier valor sensible por el nombre de su variable. -->

### M-01 — <título>

**Se validó con:** navegador: `e2e/…spec.ts`

```
$ <comando>
<salida>
```

**Cómo se enseñó:** <qué se abrió, qué se hizo, qué apareció>

## Comprobaciones generales

```
$ node scripts/verificar-cobertura.mjs
<salida>
```

```
$ <tests unitarios>
<salida>
```

```
$ <tests de navegador>
<salida>
```

## Checklist

<!-- Marca solo lo verificado de verdad. Un punto sin marcar y justificado es información útil. -->

- [ ] La ficha está **Verificada** con todos sus requisitos **Validada** (si cierra una feature)
- [ ] `docs/` actualizado donde el cambio lo deja desfasado
- [ ] Entrada en `changelog/` con "Cómo se comprobó"
- [ ] `/security-review` si hay cambios sensibles (auth, pagos, datos personales, secretos)
