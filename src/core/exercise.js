import { uid } from './utils.js';

/**
 * Modelo genérico de un ejercicio. Es deliberadamente neutro respecto a la
 * operación: cualquier operación futura (multiplicación, fracciones, etc.)
 * produce este mismo objeto, y así la UI/estadísticas no necesitan cambiar.
 *
 * @typedef {Object} Exercise
 * @property {string} id           Identificador único.
 * @property {string} operationId  Operación que lo generó (ej. 'suma-1d').
 * @property {string} category     Categoría para agrupar en estadísticas (ej. 'suma').
 * @property {string} prompt       Texto a mostrar (ej. "3 + 5").
 * @property {number} answer       Respuesta correcta.
 * @property {Object} meta         Datos extra (operandos, rango de respuestas…).
 */

/** Crea un ejercicio con un id único. */
export function createExercise({ operationId, category, prompt, answer, meta = {} }) {
  return { id: uid('ex'), operationId, category, prompt, answer, meta };
}
