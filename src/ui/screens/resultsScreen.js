import { el, mount } from '../dom.js';
import { getAllOperations } from '../../operations/registry.js';
import { sound } from '../../core/sound.js';

/**
 * Pantalla de estadísticas finales. Pura presentación: recibe `stats` ya
 * calculado y la `round`, y ofrece volver a jugar / repasar errores / inicio.
 */
export class ResultsScreen {
  constructor({ stats, round, onPlayAgain, onRetryMissed, onHome }) {
    Object.assign(this, { stats, round, onPlayAgain, onRetryMissed, onHome });
  }

  mount(root) {
    const s = this.stats;
    const emoji = s.accuracy >= 90 ? '🏆' : s.accuracy >= 70 ? '🌟' : s.accuracy >= 50 ? '👍' : '💪';
    const message =
      s.accuracy >= 90
        ? '¡Eres una estrella de las matemáticas!'
        : s.accuracy >= 70
          ? '¡Muy buen trabajo!'
          : s.accuracy >= 50
            ? '¡Vas mejorando!'
            : '¡Sigue practicando, tú puedes!';

    sound.finish();

    const container = el('section', { class: 'screen results-screen' }, [
      el('div', { class: 'results-emoji', text: emoji }),
      el('h1', { class: 'results-title', text: message }),
      el('div', { class: 'score-big', html: `${s.accuracy}<span>%</span>` }),

      el('div', { class: 'stats-grid' }, [
        statCard('✅', 'Correctas', s.correct),
        statCard('❌', 'Incorrectas', s.incorrect),
        statCard('⏰', 'Sin tiempo', s.timedOut),
        statCard('🔥', 'Mejor racha', s.bestStreak),
        statCard('⏱️', 'Tiempo medio', `${s.avgTime.toFixed(1)} s`),
        statCard('📚', 'Total', s.total),
      ]),

      this._categorySection(),
      this._missedSection(),

      el('div', { class: 'results-actions' }, [
        el('button', { class: 'btn-primary', text: '🔄 Jugar otra vez', onClick: () => this.onPlayAgain() }),
        s.missed.length
          ? el('button', {
              class: 'btn-secondary',
              text: `✏️ Repasar las ${s.missed.length} que fallé`,
              onClick: () => this.onRetryMissed(),
            })
          : null,
        el('button', { class: 'btn-ghost', text: '🏠 Inicio', onClick: () => this.onHome() }),
      ]),
    ]);

    mount(root, container);
  }

  _categorySection() {
    const cats = Object.entries(this.stats.byCategory);
    if (!cats.length) return null;
    return el('div', { class: 'category-section' }, [
      el('h2', { class: 'section-title', text: 'Por tipo de operación' }),
      ...cats.map(([cat, d]) => {
        const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
        return el('div', { class: 'category-row' }, [
          el('span', { class: 'category-name', text: labelForCategory(cat) }),
          el('div', { class: 'category-bar' }, [
            el('div', { class: 'category-bar-fill', style: `width:${pct}%` }),
          ]),
          el('span', { class: 'category-score', text: `${d.correct}/${d.total}` }),
        ]);
      }),
    ]);
  }

  _missedSection() {
    if (!this.stats.missed.length) {
      return el('div', { class: 'perfect-note', text: '¡No fallaste ninguna! 🎉' });
    }
    return el('details', { class: 'missed-section' }, [
      el('summary', { text: `Operaciones para repasar (${this.stats.missed.length})` }),
      el(
        'div',
        { class: 'missed-list' },
        this.stats.missed.map((m) =>
          el('div', { class: 'missed-item' }, [
            el('span', { class: 'missed-prompt', text: `${m.prompt} = ${m.answer}` }),
            el('span', {
              class: 'missed-yours',
              text: m.timedOut ? '⏰ sin responder' : `marcaste ${m.selected}`,
            }),
          ])
        )
      ),
    ]);
  }
}

function statCard(icon, label, value) {
  return el('div', { class: 'stat-card' }, [
    el('div', { class: 'stat-icon', text: icon }),
    el('div', { class: 'stat-value', text: String(value) }),
    el('div', { class: 'stat-label', text: label }),
  ]);
}

/** Etiqueta legible para una categoría; usa el label de la operación si existe. */
function labelForCategory(cat) {
  const op = getAllOperations().find((o) => o.category === cat);
  if (op) return op.label;
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}
