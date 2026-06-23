import { createExercise } from '../core/exercise.js';
import { range } from '../core/utils.js';

/**
 * Restas de un dígito: a - b, con 0 <= b <= a <= max (por defecto 0..9).
 * Se restringe a resultados no negativos, apropiado para reforzar a esta edad.
 * Usa el signo menos "−" (U+2212) por estética; el cálculo es numérico.
 */
export const subtraction = {
  id: 'resta-1d',
  label: 'Restas',
  category: 'resta',
  icon: '➖',
  range: { min: 0, max: 9 }, // rango propio de esta operación

  generateAll(opts = {}) {
    const min = opts.min ?? this.range.min;
    const max = opts.max ?? this.range.max;
    const exercises = [];
    for (const a of range(min, max)) {
      for (const b of range(min, a)) {
        exercises.push(
          createExercise({
            operationId: this.id,
            category: this.category,
            prompt: `${a} − ${b}`,
            answer: a - b,
            meta: { a, b, maxAnswer: max },
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
