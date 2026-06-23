// Utilidades puras compartidas (sin dependencias del DOM).

/** Entero aleatorio entre min y max, ambos inclusive. */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Devuelve una copia barajada del arreglo (Fisher-Yates). No muta el original. */
export function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Limita un valor al rango [min, max]. */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Arreglo de enteros desde start hasta end, ambos inclusive. */
export function range(start, end) {
  const out = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/** Elemento aleatorio de un arreglo. */
export function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/** Identificador corto único (suficiente para uso en el cliente). */
export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
