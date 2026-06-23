import { el, mount } from '../dom.js';
import { CountdownTimer } from '../../core/timer.js';
import { sound } from '../../core/sound.js';
import { pick } from '../../core/utils.js';

const PRAISE = ['¡Muy bien! 🎉', '¡Correcto! ⭐', '¡Excelente! 🚀', '¡Genial! 😃', '¡Eso es! 👏'];

/**
 * Pantalla del juego. Encapsula todo el ciclo de una ronda: muestra el ejercicio
 * y 9 opciones (rejilla 3x3), corre la cuenta regresiva, da retroalimentación y
 * avanza. Al terminar llama a onComplete(round).
 *
 * Soporta teclado: teclas 1-9 seleccionan la opción correspondiente.
 */
export class QuizScreen {
  constructor({ round, config, onComplete, onQuit }) {
    this.round = round;
    this.config = config;
    this.onComplete = onComplete;
    this.onQuit = onQuit;
    this.timer = null;
    this.locked = false; // true mientras se muestra la retroalimentación
    this.currentOptions = [];
    this.optionButtons = [];
    this._keyHandler = (e) => this._onKey(e);
    this._questionStart = 0;
  }

  mount(root) {
    this.root = root;

    this.progressLabel = el('span', { class: 'progress-label' });
    this.streakLabel = el('span', { class: 'streak-label' });
    this.muteBtn = el('button', {
      class: 'btn-ghost icon',
      text: sound.muted ? '🔇' : '🔊',
      title: 'Silenciar',
      onClick: () => {
        const m = sound.toggleMute();
        this.muteBtn.textContent = m ? '🔇' : '🔊';
      },
    });

    const header = el('div', { class: 'quiz-header' }, [
      el('button', { class: 'btn-ghost', text: '✕ Salir', onClick: () => this._quit() }),
      el('div', { class: 'quiz-header-center' }, [this.progressLabel, this.streakLabel]),
      this.muteBtn,
    ]);

    this.progressBarFill = el('div', { class: 'progress-bar-fill' });
    const progressBar = el('div', { class: 'progress-bar' }, [this.progressBarFill]);

    this.promptEl = el('div', { class: 'prompt' });
    this.timerFill = el('div', { class: 'timer-fill' });
    this.timerBar = el('div', { class: 'timer-bar' }, [this.timerFill]);
    this.timerNum = el('div', { class: 'timer-num' });
    this.optionsGrid = el('div', { class: 'options-grid' });
    this.feedbackEl = el('div', { class: 'feedback' });

    this.container = el('section', { class: 'screen quiz-screen' }, [
      header,
      progressBar,
      el('div', { class: 'quiz-body' }, [
        this.promptEl,
        el('div', { class: 'timer-wrap' }, [this.timerBar, this.timerNum]),
        this.optionsGrid,
        this.feedbackEl,
      ]),
    ]);

    mount(root, this.container);
    document.addEventListener('keydown', this._keyHandler);
    this._renderQuestion();
  }

  _renderQuestion() {
    this.locked = false;
    const ex = this.round.current;
    const number = this.round.index + 1;

    this.progressLabel.textContent = `Pregunta ${number} de ${this.round.total}`;
    this.progressBarFill.style.width = `${(this.round.index / this.round.total) * 100}%`;
    const streak = this.round.currentStreak();
    this.streakLabel.textContent = streak >= 2 ? `🔥 ${streak} seguidas` : '';

    this.promptEl.textContent = ex.prompt;
    this.promptEl.classList.remove('pop');
    void this.promptEl.offsetWidth; // reinicia la animación
    this.promptEl.classList.add('pop');

    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'feedback';

    // Opciones (rejilla 3x3). El número de tecla se muestra en una esquina.
    this.currentOptions = this.round.optionsFor(ex);
    this.optionButtons = this.currentOptions.map((value, i) => {
      const btn = el(
        'button',
        { class: 'option-btn', onClick: () => this._select(value) },
        [
          el('span', { class: 'option-key', text: String(i + 1) }),
          el('span', { class: 'option-value', text: String(value) }),
        ]
      );
      return btn;
    });
    this.optionsGrid.replaceChildren(...this.optionButtons);

    // Cuenta regresiva. Se reinicia la barra al 100% sin animación.
    this.timerFill.style.transition = 'none';
    this.timerFill.style.width = '100%';
    this.timerFill.classList.remove('low');
    void this.timerFill.offsetWidth;
    this.timerFill.style.transition = '';

    this.timer = new CountdownTimer({
      duration: this.config.timePerQuestion,
      onTick: (rem, dur) => this._updateTimer(rem, dur),
      onExpire: () => this._timeout(),
    });
    this._questionStart = Date.now();
    this.timer.start();
  }

  _updateTimer(remaining, duration) {
    const pct = Math.max(0, (remaining / duration) * 100);
    this.timerFill.style.width = `${pct}%`;
    this.timerNum.textContent = String(Math.ceil(remaining));
    this.timerFill.classList.toggle('low', remaining <= duration * 0.3);
  }

  _onKey(e) {
    if (this.locked) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= this.currentOptions.length) {
      this._select(this.currentOptions[n - 1]);
    }
  }

  _select(value) {
    if (this.locked) return;
    this.locked = true;
    this.timer.stop();
    const timeTaken = (Date.now() - this._questionStart) / 1000;
    const ex = this.round.current;
    const correct = value === ex.answer;

    this.optionButtons.forEach((btn, i) => {
      btn.disabled = true;
      const v = this.currentOptions[i];
      if (v === ex.answer) btn.classList.add('correct');
      if (v === value && !correct) btn.classList.add('wrong');
    });

    if (correct) sound.correct();
    else sound.wrong();

    this._showFeedback(correct ? 'correct' : 'wrong', ex);
    this.round.record({ selected: value, timedOut: false, timeTaken });
    this._scheduleNext();
  }

  _timeout() {
    if (this.locked) return;
    this.locked = true;
    const ex = this.round.current;

    this.optionButtons.forEach((btn, i) => {
      btn.disabled = true;
      if (this.currentOptions[i] === ex.answer) btn.classList.add('correct');
    });

    sound.timeout();
    this._showFeedback('timeout', ex);
    this.round.record({ selected: null, timedOut: true, timeTaken: this.config.timePerQuestion });
    this._scheduleNext();
  }

  _showFeedback(type, ex) {
    const text =
      type === 'correct'
        ? pick(PRAISE)
        : type === 'wrong'
          ? `Casi… era ${ex.answer} 💪`
          : `¡Se acabó el tiempo! Era ${ex.answer} ⏰`;
    this.feedbackEl.textContent = text;
    this.feedbackEl.className = `feedback show ${type}`;
  }

  _scheduleNext() {
    setTimeout(() => {
      if (this.round.isComplete) {
        this._cleanup();
        this.onComplete(this.round);
      } else {
        this._renderQuestion();
      }
    }, this.config.feedbackDelayMs);
  }

  _quit() {
    this._cleanup();
    this.onQuit();
  }

  _cleanup() {
    if (this.timer) this.timer.stop();
    document.removeEventListener('keydown', this._keyHandler);
  }
}
