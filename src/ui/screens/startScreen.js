import { el, mount } from '../dom.js';
import { getAllOperations } from '../../operations/registry.js';
import { bestAccuracy } from '../../core/storage.js';

const TIME_OPTIONS = [
  { value: 1, label: '👑 GOD', sub: '1 s' },
  { value: 3, label: '🔥 INSANO', sub: '3 s' },
  { value: 8, label: '⚡ Rápido', sub: '8 s' },
  { value: 12, label: '😊 Normal', sub: '12 s' },
  { value: 20, label: '🐢 Tranquilo', sub: '20 s' },
];

const SIZE_OPTIONS = [
  { value: 20, label: 'Rápida', sub: '20 preguntas' },
  { value: 50, label: 'Media', sub: '50 preguntas' },
  { value: null, label: 'Completa', sub: 'todas las operaciones' },
];

const ENTER_OPTIONS = [
  { value: true, label: '⏎ Con Enter', sub: 'confirmas tú' },
  { value: false, label: '⚡ Automático', sub: 'revisa al instante' },
];

/**
 * Pantalla de inicio: elegir operaciones, tiempo y tamaño de ronda.
 * Las operaciones se listan automáticamente desde el registro, así que cuando
 * agregues una operación nueva aparece aquí sola.
 */
export class StartScreen {
  constructor({ config, onStart }) {
    this.config = config;
    this.onStart = onStart;
    this.selectedOps = new Set(config.enabledOperations);
    this.time = config.timePerQuestion;
    this.size = config.roundSize;
    this.requireEnter = config.requireEnter !== false;
  }

  mount(root) {
    const best = bestAccuracy();
    const ops = getAllOperations();

    const opChips = el(
      'div',
      { class: 'chips' },
      ops.map((op) => {
        const chip = el(
          'button',
          {
            class: `chip ${this.selectedOps.has(op.id) ? 'selected' : ''}`,
            onClick: () => this._toggleOp(op.id, chip),
          },
          [el('span', { text: `${op.icon || ''} ${op.label}` })]
        );
        return chip;
      })
    );

    const timeChips = this._radioGroup(TIME_OPTIONS, this.time, (v) => {
      this.time = v;
    });
    const sizeChips = this._radioGroup(SIZE_OPTIONS, this.size, (v) => {
      this.size = v;
    });
    const enterChips = this._radioGroup(ENTER_OPTIONS, this.requireEnter, (v) => {
      this.requireEnter = v;
    });

    this.startBtn = el('button', {
      class: 'btn-primary big',
      text: '¡Empezar! 🚀',
      onClick: () => this._start(),
    });
    this.startBtn.disabled = this.selectedOps.size === 0;

    const container = el('section', { class: 'screen start-screen' }, [
      el('div', { class: 'hero' }, [
        el('div', { class: 'hero-emoji', text: '🪄' }),
        el('h1', { class: 'app-title', text: 'Matemágicas' }),
        el('p', { class: 'app-subtitle', text: 'Suma, resta, multiplica y divide' }),
      ]),
      best > 0 ? el('div', { class: 'best-badge', text: `🏆 Tu mejor marca: ${best}%` }) : null,
      sectionBlock('¿Qué quieres practicar?', opChips),
      sectionBlock('¿Cuánto tiempo por pregunta?', timeChips),
      sectionBlock('¿Cómo responder?', enterChips),
      sectionBlock('Tamaño de la ronda', sizeChips),
      this.startBtn,
      el('div', { class: 'share-footer' }, [
        el('img', {
          class: 'qr-img',
          src: 'qr.svg',
          alt: 'Código QR para abrir el juego',
          width: '120',
          height: '120',
        }),
        el('p', {
          class: 'share-caption',
          text: '📱 Escanéalo para jugar en celular o tablet',
        }),
      ]),
    ]);

    mount(root, container);
  }

  /** Grupo tipo "radio": una sola selección entre varias opciones. */
  _radioGroup(options, current, onChange) {
    const group = el(
      'div',
      { class: 'chips' },
      options.map((opt) => {
        const chip = el(
          'button',
          {
            class: `chip ${opt.value === current ? 'selected' : ''}`,
            onClick: () => {
              onChange(opt.value);
              Array.from(group.children).forEach((c, i) =>
                c.classList.toggle('selected', options[i].value === opt.value)
              );
            },
          },
          [el('span', { text: opt.label }), el('small', { text: opt.sub })]
        );
        return chip;
      })
    );
    return group;
  }

  _toggleOp(id, chip) {
    if (this.selectedOps.has(id)) this.selectedOps.delete(id);
    else this.selectedOps.add(id);
    chip.classList.toggle('selected');
    this.startBtn.disabled = this.selectedOps.size === 0;
  }

  _start() {
    if (this.selectedOps.size === 0) return;
    this.onStart({
      enabledOperations: Array.from(this.selectedOps),
      timePerQuestion: this.time,
      roundSize: this.size,
      requireEnter: this.requireEnter,
    });
  }
}

function sectionBlock(title, content) {
  return el('div', { class: 'section' }, [
    el('h2', { class: 'section-title', text: title }),
    content,
  ]);
}
