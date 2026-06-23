import { shuffle } from './utils.js';

/**
 * Genera `count` respuestas incorrectas (distractores) distintas y plausibles.
 *
 * Estrategia pedagógica: las opciones cercanas a la respuesta correcta obligan
 * a calcular de verdad (no se puede adivinar por descarte). Si el rango es muy
 * pequeño para tantas opciones, se ensancha automáticamente.
 *
 * @param {number} correct  Respuesta correcta (se excluye de los distractores).
 * @param {number} count    Cuántos distractores generar.
 * @param {{min?: number, max?: number}} rango  Rango plausible de respuestas.
 * @returns {number[]}  `count` valores distintos, distintos de `correct`.
 */
export function numericDistractors(correct, count, { min = 0, max = correct + 9 } = {}) {
  let lo = Math.min(min, correct);
  let hi = Math.max(max, correct);

  // Asegura que haya al menos `count` candidatos además del correcto.
  while ((hi - lo) < count) {
    hi += 1;
    if (lo > 0) lo -= 1;
  }

  // Todos los candidatos posibles, ordenados por cercanía a la respuesta.
  const pool = [];
  for (let v = lo; v <= hi; v++) {
    if (v !== correct) pool.push(v);
  }
  pool.sort((a, b) => Math.abs(a - correct) - Math.abs(b - correct) || a - b);

  // Tomamos una ventana un poco mayor que `count` y la barajamos, para que las
  // opciones no sean siempre exactamente las más cercanas (algo de variedad).
  const windowSize = Math.min(pool.length, Math.max(count + 2, Math.ceil(count * 1.5)));
  const near = pool.slice(0, windowSize);
  return shuffle(near).slice(0, count);
}
