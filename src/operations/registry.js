/**
 * Registro de operaciones (patrón de plugins).
 *
 * Una "operación" describe un tipo de ejercicio y sabe generar TODOS sus
 * ejercicios posibles. Para agregar una operación nueva no se toca este archivo
 * ni la UI: basta con crear el módulo de la operación y registrarlo en main.js.
 *
 * Interfaz que debe cumplir cada operación:
 *
 *   {
 *     id: string,            // único, ej. 'suma-1d'
 *     label: string,         // nombre visible, ej. 'Sumas'
 *     category: string,      // para agrupar estadísticas, ej. 'suma'
 *     icon?: string,         // emoji opcional para la UI
 *     generateAll(config) -> Exercise[]   // universo completo de ejercicios
 *     optionRange?(exercise) -> {min, max} // rango para los distractores
 *   }
 */

const registry = new Map();

/** Registra una operación. Lanza error si no tiene id. */
export function registerOperation(operation) {
  if (!operation || !operation.id) {
    throw new Error('Una operación debe tener un "id".');
  }
  registry.set(operation.id, operation);
}

/** Devuelve la operación con ese id (o undefined). */
export function getOperation(id) {
  return registry.get(id);
}

/** Todas las operaciones registradas, en orden de registro. */
export function getAllOperations() {
  return Array.from(registry.values());
}
