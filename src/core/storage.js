/**
 * Persistencia ligera en localStorage. Guarda el historial de rondas para poder
 * mostrar la mejor marca y, en el futuro, progreso por operación.
 * Todo va envuelto en try/catch para que la app nunca se rompa si el navegador
 * tiene el almacenamiento deshabilitado.
 */
const KEY = 'matematicas:history:v1';
const MAX_ENTRIES = 50;

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

/** Agrega una ronda al historial (la más reciente primero) y devuelve el historial. */
export function saveResult(entry) {
  const history = loadHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* sin almacenamiento: seguimos sin persistir */
  }
  return trimmed;
}

/** Mejor precisión (%) histórica, 0 si no hay historial. */
export function bestAccuracy() {
  return loadHistory().reduce((max, e) => Math.max(max, e.accuracy || 0), 0);
}
