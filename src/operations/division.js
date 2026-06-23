import { createExercise } from '../core/exercise.js';

/**
 * Divisiones exactas derivadas de las tablas: a ÷ b = q, donde a = b × q.
 * Así toda división corresponde a un hecho de la tabla de multiplicar y el
 * resultado siempre es exacto (sin residuo).
 *
 *   - divisor  b ∈ [1, max]   (nunca 0: no se divide entre cero)
 *   - cociente q ∈ [0, max]
 *   - dividendo a = b × q      (0 … 144 con max = 12)
 *
 * La respuesta es el cociente q, por eso los distractores van en [0, max].
 * Usa el signo "÷" (U+00F7); el cálculo es numérico.
 */
export const division = {
  id: 'division-12',
  label: 'Divisiones',
  category: 'division',
  icon: '➗',
  range: { min: 0, max: 12 }, // rango propio (tablas 0–12)

  generateAll(opts = {}) {
    const min = opts.min ?? this.range.min;
    const max = opts.max ?? this.range.max;
    const bStart = Math.max(1, min); // el divisor nunca es 0
    const exercises = [];
    for (let b = bStart; b <= max; b++) {
      for (let q = min; q <= max; q++) {
        const a = b * q;
        exercises.push(
          createExercise({
            operationId: this.id,
            category: this.category,
            prompt: `${a} ÷ ${b}`,
            answer: q,
            meta: { a, b, q, maxAnswer: max },
          })
        );
      }
    }
    return exercises;
  },

  optionRange(exercise) {
    return { min: 0, max: exercise.meta.maxAnswer };
  },
};
