/**
 * Configuración por defecto. La pantalla de inicio puede sobreescribir algunos
 * de estos valores antes de empezar una ronda.
 */
export const defaultConfig = {
  optionsCount: 9, // opciones por pregunta (incluye la correcta) -> rejilla 3x3
  timePerQuestion: 12, // segundos de cuenta regresiva por pregunta
  enabledOperations: ['suma-1d', 'resta-1d', 'multi-12', 'division-12'], // operaciones activas por defecto
  roundSize: null, // null = cubrir TODAS las operaciones; o un número para acotar
  feedbackDelayMs: 950, // pausa para mostrar el resultado antes de la siguiente
  shuffleRound: true, // barajar el orden de los ejercicios

  // Rango por operación (opcional). Si no se indica, cada operación usa el suyo
  // (definido en su archivo, p. ej. tablas 0–12). Ejemplo de override:
  //   operationConfig: { 'multi-12': { min: 1, max: 10 } }
  operationConfig: {},
};
