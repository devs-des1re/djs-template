import { fileURLToPath } from 'node:url';
import { loadInteractionHandlers } from '../lib/interactions.js';

const buttonsDirectory = fileURLToPath(new URL('../interactions/buttons', import.meta.url));

export function loadButtons() {
  return loadInteractionHandlers(buttonsDirectory);
}
