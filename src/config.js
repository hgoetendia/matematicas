/**
 * Configuración por defecto. La pantalla de inicio puede sobreescribir algunos
 * de estos valores antes de empezar una ronda.
 */
export const defaultConfig = {
  optionsCount: 9, // opciones por pregunta (incluye la correcta) -> rejilla 3x3
  timePerQuestion: 12, // segundos de cuenta regresiva por pregunta
  enabledOperations: [], // ninguna preseleccionada: el niño elige qué practicar
  roundSize: null, // null = cubrir TODAS las operaciones (Completa); o un número para acotar
  requireEnter: false, // teclado: false = auto al completar dígitos; true = confirmar con Enter
  feedbackDelayMs: 950, // pausa para mostrar el resultado antes de la siguiente
  shuffleRound: true, // barajar el orden de los ejercicios

  // Rango por operación (opcional). Si no se indica, cada operación usa el suyo
  // (definido en su archivo, p. ej. tablas 0–12). Ejemplo de override:
  //   operationConfig: { 'multi-12': { min: 1, max: 10 } }
  operationConfig: {},
};
