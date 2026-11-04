#!/usr/bin/env node
/**
 * Hook PreToolUse para Bash: convierte en pregunta cualquier comando destructivo.
 *
 * Es la regla "nada destructivo sin confirmación" de AGENTS.md convertida en mecanismo: aunque
 * los permisos de settings.json dejaran pasar el comando, aquí se para y se pregunta a la
 * persona, con el motivo. No bloquea nada por sí solo; pide confirmación.
 *
 * Lee la llamada por stdin (JSON con tool_name y tool_input.command). Si no es Bash, si no hay
 * comando o si no reconoce nada peligroso, no dice nada y la ejecución sigue como siempre.
 */

const PELIGROSOS = [
  [/\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\b/i, 'borra archivos de forma recursiva y sin preguntar'],
  [/\bgit\s+push\b.*(--force\b|-f\b|--force-with-lease\b)/i, 'reescribe el historial remoto'],
  [/\bgit\s+reset\s+--hard\b/i, 'descarta cambios locales sin posibilidad de recuperarlos'],
  [/\bgit\s+clean\b.*-[a-z]*f/i, 'borra archivos no versionados'],
  [/\bgit\s+rm\b.*\s-[a-z]*r/i, 'borra una carpeta versionada entera'],
  [/\bgit\s+branch\s+(-D|--delete\s+--force)\b/i, 'borra una rama a la fuerza'],
  [/\bgit\s+checkout\s+--\s+\./i, 'descarta todos los cambios del árbol de trabajo'],
  [/\bgit\s+rebase\b/i, 'reescribe el historial local'],
  [/\b(drop|truncate)\s+(table|database|schema)\b/i, 'destruye datos en la base de datos'],
  [/\bdelete\s+from\b(?![\s\S]*\bwhere\b)/i, 'borra todas las filas de una tabla (DELETE sin WHERE)'],
  [/\bgh\s+repo\s+delete\b/i, 'borra un repositorio en GitHub'],
  [/\bsupabase\s+db\s+reset\b/i, 'reinicia la base de datos'],
  [/\bprisma\s+migrate\s+reset\b/i, 'reinicia la base de datos'],
];

let entrada = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (entrada += d));
process.stdin.on('end', () => {
  let llamada;
  try {
    llamada = JSON.parse(entrada);
  } catch {
    process.exit(0);
  }
  if (llamada?.tool_name !== 'Bash') process.exit(0);
  const comando = String(llamada?.tool_input?.command ?? '');
  if (!comando) process.exit(0);

  const motivo = PELIGROSOS.find(([re]) => re.test(comando))?.[1];
  if (!motivo) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason:
          `Comando destructivo: ${motivo}. AGENTS.md pide confirmación con el alcance exacto ` +
          `de lo que va a desaparecer antes de ejecutarlo.`,
      },
    }),
  );
  process.exit(0);
});
