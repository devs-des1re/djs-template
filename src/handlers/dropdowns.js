import { fileURLToPath } from 'node:url';
import { loadInteractionHandlers } from '../lib/interactions.js';

const dropdownsDirectory = fileURLToPath(new URL('../interactions/dropdowns', import.meta.url));

export function loadDropdowns() {
  return loadInteractionHandlers(dropdownsDirectory);
}
