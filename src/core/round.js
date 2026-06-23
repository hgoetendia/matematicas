import { shuffle } from './utils.js';
import { numericDistractors } from './distractors.js';
import { getOperation } from '../operations/registry.js';

/**
 * Motor de una ronda. Es la única fuente de verdad del progreso: qué ejercicio
 * va, qué se respondió y los tiempos. No conoce el DOM ni el temporizador.
 */
export class Round {
  /**
   * @param {Object} opts
   * @param {import('./exercise.js').Exercise[]} opts.exercises  Ejercicios de la ronda (ya ordenados).
   * @param {number} [opts.optionsCount]      Cuántas opciones por pregunta (incluye la correcta).
   * @param {number} [opts.timePerQuestion]   Segundos por pregunta.
   */
  constructor({ exercises, optionsCount = 9, timePerQuestion = 12 }) {
    this.exercises = exercises;
    this.optionsCount = optionsCount;
    this.timePerQuestion = timePerQuestion;
    this.index = 0;
    /** @type {Array<{exercise, selected, correct, timedOut, timeTaken}>} */
    this.records = [];
    this.startedAt = Date.now();
  }

  get total() {
    return this.exercises.length;
  }

  get current() {
    return this.exercises[this.index];
  }

  get isComplete() {
    return this.index >= this.exercises.length;
  }

  /**
   * Construye las opciones (barajadas) para un ejercicio: la respuesta correcta
   * más los distractores que aporta la operación. Se llama una vez por pregunta.
   */
  optionsFor(exercise) {
    const op = getOperation(exercise.operationId);
    const range =
      op && op.optionRange
        ? op.optionRange(exercise)
        : { min: 0, max: exercise.answer + 9 };
    const distractors = numericDistractors(exercise.answer, this.optionsCount - 1, range);
    return shuffle([exercise.answer, ...distractors]);
  }

  /**
   * Registra la respuesta al ejercicio actual y avanza al siguiente.
   * @returns {{correct: boolean}}
   */
  record({ selected, timedOut, timeTaken }) {
    const exercise = this.current;
    const correct = !timedOut && selected === exercise.answer;
    this.records.push({
      exercise,
      selected: timedOut ? null : selected,
      correct,
      timedOut: !!timedOut,
      timeTaken,
    });
    this.index += 1;
    return { correct };
  }

  /** Racha actual de aciertos consecutivos (mirando hacia atrás). */
  currentStreak() {
    let s = 0;
    for (let i = this.records.length - 1; i >= 0; i--) {
      if (this.records[i].correct) s++;
      else break;
    }
    return s;
  }
}
