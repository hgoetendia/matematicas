/**
 * Calcula las estadísticas finales a partir de los registros de una ronda.
 * Función pura: recibe la ronda y devuelve un objeto con los números listos
 * para pintar. Cualquier operación nueva aparece automáticamente en `byCategory`.
 */
export function computeStats(round) {
  const records = round.records;
  const total = records.length;
  const correct = records.filter((r) => r.correct).length;
  const timedOut = records.filter((r) => r.timedOut).length;
  const incorrect = total - correct - timedOut;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  // Mejor racha de aciertos.
  let streak = 0;
  let bestStreak = 0;
  for (const r of records) {
    if (r.correct) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  // Tiempo promedio sobre las preguntas realmente respondidas (sin timeouts).
  const answered = records.filter((r) => !r.timedOut && typeof r.timeTaken === 'number');
  const avgTime = answered.length
    ? answered.reduce((s, r) => s + r.timeTaken, 0) / answered.length
    : 0;

  // Desglose por categoría (sumas, restas, y lo que venga en el futuro).
  const byCategory = {};
  for (const r of records) {
    const cat = r.exercise.category;
    if (!byCategory[cat]) byCategory[cat] = { total: 0, correct: 0 };
    byCategory[cat].total++;
    if (r.correct) byCategory[cat].correct++;
  }

  // Lista de las que conviene repasar.
  const missed = records
    .filter((r) => !r.correct)
    .map((r) => ({
      prompt: r.exercise.prompt,
      answer: r.exercise.answer,
      selected: r.selected,
      timedOut: r.timedOut,
    }));

  const totalTime = (Date.now() - round.startedAt) / 1000;

  return {
    total,
    correct,
    incorrect,
    timedOut,
    accuracy,
    bestStreak,
    avgTime,
    byCategory,
    missed,
    totalTime,
  };
}
