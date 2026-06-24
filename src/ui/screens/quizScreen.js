import { el, mount } from '../dom.js';
import { CountdownTimer } from '../../core/timer.js';
import { sound } from '../../core/sound.js';
import { pick } from '../../core/utils.js';

const PRAISE = ['¡Muy bien! 🎉', '¡Correcto! ⭐', '¡Excelente! 🚀', '¡Genial! 😃', '¡Eso es! 👏'];

// Distribución tipo numpad: 7-8-9 / 4-5-6 / 1-2-3 / ⌫-0-↵
const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

/**
 * Pantalla del juego. El niño escribe la respuesta en un teclado numérico
 * (numpad). Dos modos, según `config.requireEnter`:
 *   - Con Enter:  escribe los dígitos y confirma con ↵ (puede borrar antes).
 *   - Automático: en cuanto la cantidad de dígitos escritos iguala la de la
 *                 respuesta, se evalúa solo (acierto o fallo).
 *
 * Soporta teclado físico: dígitos 0-9, Retroceso (borrar) y Enter (confirmar).
 */
export class QuizScreen {
  constructor({ round, config, onComplete, onQuit }) {
    this.round = round;
    this.config = config;
    this.requireEnter = config.requireEnter !== false; // por defecto, con Enter
    this.onComplete = onComplete;
    this.onQuit = onQuit;
    this.timer = null;
    this.locked = false; // true mientras se muestra la retroalimentación
    this.input = ''; // dígitos escritos para la pregunta actual
    this.answerLen = 1; // nº de dígitos de la respuesta correcta
    this.maxLen = 3; // tope de dígitos que se pueden escribir
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

    // Ecuación: "8 × 5 = [casilla con lo escrito]"
    this.promptEl = el('span', { class: 'prompt' });
    this.answerBox = el('span', { class: 'answer-box' });
    this.equation = el('div', { class: 'equation' }, [
      this.promptEl,
      el('span', { class: 'equals', text: '=' }),
      this.answerBox,
    ]);

    this.timerFill = el('div', { class: 'timer-fill' });
    this.timerBar = el('div', { class: 'timer-bar' }, [this.timerFill]);
    this.timerNum = el('div', { class: 'timer-num' });

    this.keypad = this._buildKeypad();
    this.feedbackEl = el('div', { class: 'feedback' });

    this.container = el('section', { class: 'screen quiz-screen' }, [
      header,
      progressBar,
      el('div', { class: 'quiz-body' }, [
        this.equation,
        el('div', { class: 'timer-wrap' }, [this.timerBar, this.timerNum]),
        this.keypad,
        this.feedbackEl,
      ]),
    ]);

    mount(root, this.container);
    document.addEventListener('keydown', this._keyHandler);
    this._renderQuestion();
  }

  /** El teclado es estático, se construye una sola vez. */
  _buildKeypad() {
    const cells = DIGITS.map((d) => el('button', { class: 'key', text: d, onClick: () => this._append(d) }));
    cells.push(el('button', { class: 'key delete', text: '⌫', title: 'Borrar', onClick: () => this._delete() }));
    cells.push(
      el('button', { class: `key ${this.requireEnter ? '' : 'wide'}`, text: '0', onClick: () => this._append('0') })
    );
    if (this.requireEnter) {
      cells.push(el('button', { class: 'key enter', text: '↵', title: 'Aceptar', onClick: () => this._submit() }));
    }
    return el('div', { class: 'keypad' }, cells);
  }

  _renderQuestion() {
    this.locked = false;
    this.input = '';
    const ex = this.round.current;
    const number = this.round.index + 1;

    this.progressLabel.textContent = `Pregunta ${number} de ${this.round.total}`;
    this.progressBarFill.style.width = `${(this.round.index / this.round.total) * 100}%`;
    const streak = this.round.currentStreak();
    this.streakLabel.textContent = streak >= 2 ? `🔥 ${streak} seguidas` : '';

    this.answerLen = String(ex.answer).length;
    const maxAnswer = ex.meta && ex.meta.maxAnswer != null ? ex.meta.maxAnswer : 999;
    this.maxLen = Math.max(this.answerLen, String(maxAnswer).length);

    this.promptEl.textContent = ex.prompt;
    this.answerBox.className = 'answer-box';
    this._updateDisplay();
    this.equation.classList.remove('pop');
    void this.equation.offsetWidth; // reinicia la animación
    this.equation.classList.add('pop');

    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'feedback';

    // Cuenta regresiva: barra reiniciada al 100% sin animación.
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

  _updateDisplay() {
    this.answerBox.textContent = this.input;
  }

  _append(digit) {
    if (this.locked) return;
    if (this.input.length >= this.maxLen) return;
    this.input += digit;
    this._updateDisplay();
    sound.tick();
    // Modo automático: evalúa al completar los dígitos de la respuesta.
    if (!this.requireEnter && this.input.length >= this.answerLen) {
      this._submit();
    }
  }

  _delete() {
    if (this.locked) return;
    this.input = this.input.slice(0, -1);
    this._updateDisplay();
  }

  _submit() {
    if (this.locked || this.input === '') return;
    this.locked = true;
    this.timer.stop();
    const timeTaken = (Date.now() - this._questionStart) / 1000;
    const ex = this.round.current;
    const value = Number(this.input);
    const correct = value === ex.answer;

    this.answerBox.classList.add(correct ? 'correct' : 'wrong');
    if (correct) {
      sound.correct();
      this._burst();
    } else {
      sound.wrong();
    }

    this._showFeedback(correct ? 'correct' : 'wrong', ex);
    this.round.record({ selected: value, timedOut: false, timeTaken });
    this._scheduleNext();
  }

  _timeout() {
    if (this.locked) return;
    this.locked = true;
    const ex = this.round.current;
    this.input = String(ex.answer); // revela la respuesta correcta
    this._updateDisplay();
    this.answerBox.classList.add('reveal');

    sound.timeout();
    this._showFeedback('timeout', ex);
    this.round.record({ selected: null, timedOut: true, timeTaken: this.config.timePerQuestion });
    this._scheduleNext();
  }

  /** Chispas de "hechizo" alrededor de la casilla al acertar (elemento firma). */
  _burst() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = this.answerBox;
    const cx = box.offsetLeft + box.offsetWidth / 2;
    const cy = box.offsetTop + box.offsetHeight / 2;
    const glyphs = ['✨', '⭐', '🌟', '💫'];
    const N = 12;
    for (let i = 0; i < N; i++) {
      const s = el('span', { class: 'spark', text: glyphs[i % glyphs.length] });
      const angle = (Math.PI * 2 * i) / N + Math.random() * 0.5;
      const dist = 45 + Math.random() * 45;
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      s.style.setProperty('--r', `${(Math.random() * 360) | 0}deg`);
      this.equation.appendChild(s);
      setTimeout(() => s.remove(), 720);
    }
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

  _updateTimer(remaining, duration) {
    const pct = Math.max(0, (remaining / duration) * 100);
    this.timerFill.style.width = `${pct}%`;
    this.timerNum.textContent = String(Math.ceil(remaining));
    this.timerFill.classList.toggle('low', remaining <= duration * 0.3);
  }

  _onKey(e) {
    if (this.locked) return;
    if (e.key >= '0' && e.key <= '9') {
      this._append(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      this._delete();
    } else if (e.key === 'Enter') {
      if (this.requireEnter) this._submit();
    }
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
