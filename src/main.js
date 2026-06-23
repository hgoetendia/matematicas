// Punto de entrada de la aplicación.
//
// Para AGREGAR UNA OPERACIÓN nueva:
//   1. Crea el módulo en src/operations/ (copia addition.js como plantilla).
//   2. Impórtalo aquí y pásalo a registerOperation(...).
//   3. (Opcional) añádelo a enabledOperations en src/config.js.
// La pantalla de inicio, las estadísticas y el juego ya lo soportan.

import { registerOperation } from './operations/registry.js';
import { addition } from './operations/addition.js';
import { subtraction } from './operations/subtraction.js';
import { multiplication } from './operations/multiplication.js';
import { division } from './operations/division.js';
import { App } from './ui/app.js';

registerOperation(addition);
registerOperation(subtraction);
registerOperation(multiplication);
registerOperation(division);

const app = new App(document.getElementById('app'));
app.start();
