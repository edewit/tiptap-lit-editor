/**
 * Editor context for sharing editor state across components
 */

import { createContext } from '@lit/context';

export const editorContext = createContext(Symbol('editor'));

