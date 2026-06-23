import { createExercise } from '../core/exercise.js';
import { range } from '../core/utils.js';

/**
 * Multiplicaciones (tablas): a × b, con a y b en [min, max] (por defecto 0..12).
 * Genera desde 0×0 hasta 12×12 (169 ejercicios). Las respuestas van de 0 a 144,
 * por eso el rango de distractores llega a max*max.
 * Usa el signo "×" (U+00D7); el cálculo es numérico.
 */
export const multiplication = {
  id: 'multi-12',
  label: 'Multiplicaciones',
  category: 'multiplicacion',
  icon: '✖️',
  range: { min: 0, max: 12 }, // rango propio de esta operación

  generateAll(opts = {}) {
    const min = opts.min ?? this.range.min;
    const max = opts.max ?? this.range.max;
    const exercises = [];
    for (const a of range(min, max)) {
      for (const b of range(min, max)) {
        exercises.push(
          createExercise({
            operationId: this.id,
            category: this.category,
            prompt: `${a} × ${b}`,
            answer: a * b,
            meta: { a, b, maxAnswer: max * max },
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
