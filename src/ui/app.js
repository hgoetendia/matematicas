import { defaultConfig } from '../config.js';
import { getOperation } from '../operations/registry.js';
import { shuffle } from '../core/utils.js';
import { Round } from '../core/round.js';
import { computeStats } from '../core/stats.js';
import { saveResult } from '../core/storage.js';
import { StartScreen } from './screens/startScreen.js';
import { QuizScreen } from './screens/quizScreen.js';
import { ResultsScreen } from './screens/resultsScreen.js';

/**
 * Controlador/enrutador de pantallas. Mantiene la configuración actual y conecta
 * las tres pantallas con el motor de la ronda. No contiene lógica de juego.
 */
export class App {
  constructor(root) {
    this.root = root;
    this.config = { ...defaultConfig };
  }

  start() {
    this.showStart();
  }

  showStart() {
    new StartScreen({
      config: this.config,
      onStart: (cfg) => {
        this.config = { ...this.config, ...cfg };
        this.startRound();
      },
    }).mount(this.root);
  }

  /**
   * Construye la lista de ejercicios de una ronda a partir de la configuración:
   * reúne el universo completo de cada operación activa, lo baraja y (opcional)
   * lo acota a `roundSize`.
   *
   * Cada operación usa su propio rango (ej. sumas 0–9, tablas 0–12). Se puede
   * sobreescribir por operación con `config.operationConfig[opId] = { min, max }`.
   */
  buildExercises(config) {
    let all = [];
    for (const opId of config.enabledOperations) {
      const op = getOperation(opId);
      if (!op) continue;
      const override = (config.operationConfig && config.operationConfig[opId]) || {};
      all = all.concat(op.generateAll(override));
    }
    if (config.shuffleRound) all = shuffle(all);
    if (config.roundSize && config.roundSize < all.length) {
      all = all.slice(0, config.roundSize);
    }
    return all;
  }

  /** Inicia una ronda. Si se pasan ejercicios, se usan tal cual (ej. repasar errores). */
  startRound(exercises = null) {
    const list = exercises || this.buildExercises(this.config);
    const round = new Round({
      exercises: list,
      optionsCount: this.config.optionsCount,
      timePerQuestion: this.config.timePerQuestion,
    });
    new QuizScreen({
      round,
      config: this.config,
      onComplete: (r) => this.showResults(r),
      onQuit: () => this.showStart(),
    }).mount(this.root);
  }

  showResults(round) {
    const stats = computeStats(round);
    saveResult({
      accuracy: stats.accuracy,
      correct: stats.correct,
      total: stats.total,
      date: Date.now(),
    });
    new ResultsScreen({
      stats,
      round,
      onPlayAgain: () => this.startRound(),
      onRetryMissed: () => {
        const missed = round.records.filter((r) => !r.correct).map((r) => r.exercise);
        this.startRound(shuffle(missed));
      },
      onHome: () => this.showStart(),
    }).mount(this.root);
  }
}
