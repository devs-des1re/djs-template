import { fileURLToPath } from 'node:url';
import { loadInteractionHandlers } from '../lib/interactions.js';

const modalsDirectory = fileURLToPath(new URL('../interactions/modals', import.meta.url));

export function loadModals() {
  return loadInteractionHandlers(modalsDirectory);
}
