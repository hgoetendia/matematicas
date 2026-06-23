import { createExercise } from '../core/exercise.js';
import { range } from '../core/utils.js';

/**
 * Sumas de un dígito: a + b, con a y b en [min, max] (por defecto 0..9).
 * Las respuestas van de 0 a 18, por eso el rango de distractores llega a max+max.
 */
export const addition = {
  id: 'suma-1d',
  label: 'Sumas',
  category: 'suma',
  icon: '➕',
  range: { min: 0, max: 9 }, // rango propio de esta operación

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
            prompt: `${a} + ${b}`,
            answer: a + b,
            meta: { a, b, maxAnswer: max + max },
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
