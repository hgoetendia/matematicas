# 🧮 Matemágicas

Aplicación web para reforzar operaciones matemáticas: se escribe la respuesta en
un **teclado numérico** y hay cuenta regresiva por pregunta. Incluye **sumas y
restas de un dígito**, **tablas de multiplicar (0–12)** y **divisiones exactas**,
y está pensada para crecer: agregar una operación nueva es crear un archivo y
registrarlo.

## Cómo ejecutarla

Los módulos ES necesitan servirse por `http://` (no sirve abrir `index.html`
directo). Cualquiera de estas opciones:

```bash
node serve.mjs            # sin dependencias -> http://localhost:8000
# o
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Cómo se juega

1. En **Inicio** eliges qué practicar (sumas, restas, multiplicaciones,
   divisiones), el tiempo por pregunta y el tamaño de la ronda (`Rápida` 20,
   `Media` 50 o `Completa`, que recorre **todas** las operaciones posibles).
2. Cada pregunta muestra la operación y un **teclado numérico** (0–9, ⌫ y ↵)
   con una barra de tiempo. Se puede usar el teclado físico (dígitos, Retroceso
   y Enter). En **¿Cómo responder?** eliges entre **Con Enter** (confirmas tú) o
   **Automático** (evalúa solo al completar los dígitos de la respuesta).
3. Al terminar la ronda se muestran las **estadísticas**: precisión, aciertos,
   errores, tiempos agotados, mejor racha, tiempo medio, desglose por tipo y la
   lista de operaciones para repasar. Puedes **repasar solo las que fallaste**.

## Arquitectura

Separación en capas para que la lógica no dependa de la interfaz:

```
src/
├── main.js              Punto de entrada: registra operaciones e inicia la app.
├── config.js            Ajustes por defecto.
├── core/                Lógica pura, sin DOM (fácil de probar y reutilizar).
│   ├── utils.js         random, shuffle, range, pick…
│   ├── exercise.js      Modelo genérico de "ejercicio".
│   ├── distractors.js   Genera opciones incorrectas plausibles.
│   ├── round.js         Motor de la ronda (estado, opciones, registro, racha).
│   ├── timer.js         Cuenta regresiva desacoplada de la UI.
│   ├── stats.js         Cálculo de estadísticas.
│   ├── storage.js       Persistencia (mejor marca) en localStorage.
│   └── sound.js         Efectos de sonido con WebAudio.
├── operations/          👈 Punto de crecimiento. Una operación = un archivo.
│   ├── registry.js      Registro tipo "plugins".
│   ├── addition.js      Sumas de 1 dígito (0–9).
│   ├── subtraction.js   Restas de 1 dígito (0–9, resultado ≥ 0).
│   ├── multiplication.js Tablas de multiplicar (0×0 … 12×12).
│   └── division.js      Divisiones exactas derivadas de las tablas.
└── ui/
    ├── dom.js           Ayudantes para crear DOM.
    ├── app.js           Enrutador de pantallas.
    └── screens/         Inicio, juego y resultados.
```

**Idea central:** la UI, el temporizador, los distractores y las estadísticas
trabajan sobre el modelo genérico `Exercise`. No saben qué operación es. Por eso
añadir operaciones no las obliga a cambiar.

### Flujo

```
StartScreen → App.buildExercises() → Round → QuizScreen → computeStats() → ResultsScreen
                                       ▲                                         │
                                       └──────────── repasar / jugar otra vez ◀─┘
```

## Cómo agregar una operación nueva

Cada operación es un objeto con su `id`, `label`, `category`, su propio `range` y
un método `generateAll()` que produce **todos** sus ejercicios. La multiplicación
(ya incluida) sirve de plantilla — `src/operations/multiplication.js`:

```js
import { createExercise } from '../core/exercise.js';
import { range } from '../core/utils.js';

export const multiplication = {
  id: 'multi-12',
  label: 'Multiplicaciones',
  category: 'multiplicacion',
  icon: '✖️',
  range: { min: 0, max: 12 },          // rango propio de la operación

  generateAll(opts = {}) {
    const min = opts.min ?? this.range.min;
    const max = opts.max ?? this.range.max;
    const out = [];
    for (const a of range(min, max))
      for (const b of range(min, max))
        out.push(createExercise({
          operationId: this.id,
          category: this.category,
          prompt: `${a} × ${b}`,
          answer: a * b,
          meta: { a, b, maxAnswer: max * max },
        }));
    return out;
  },

  optionRange(ex) {
    return { min: 0, max: ex.meta.maxAnswer };
  },
};
```

Para sumar una operación nueva (p. ej. potencias):

1. Crea `src/operations/potencias.js` copiando el patrón de arriba.
2. Regístrala en `src/main.js`:

   ```js
   import { potencias } from './operations/potencias.js';
   registerOperation(potencias);
   ```

3. (Opcional) actívala por defecto en `src/config.js` → `enabledOperations`, o
   ajústale el rango con `operationConfig['potencias'] = { min, max }`.

Listo: aparece en la pantalla de inicio, se incluye en las rondas, genera sus
distractores y se desglosa en las estadísticas, sin tocar nada más.

> Cada operación usa su propio `range`, por eso en una misma ronda conviven
> sumas/restas (0–9) y tablas (0–12) sin conflicto.

> Para respuestas no numéricas (p. ej. comparar `> < =`), el contrato a extender
> sería la generación de opciones; hoy `Round.optionsFor` usa distractores
> numéricos. Es el único punto que tocarías para ese caso.

## Ideas de crecimiento

- Más operaciones: sumas/restas de 2–3 dígitos, potencias, "encuentra el número
  que falta" (`3 + ▢ = 7`), comparaciones, fracciones.
- Niveles de dificultad y rangos configurables por operación.
- Perfiles por niño y seguimiento de progreso por operación (ya hay base en
  `storage.js`).
- Modo "sin fin" (añadir `generateRandom()` a la operación y un modo en `Round`).
- Tabla de logros / medallas.
