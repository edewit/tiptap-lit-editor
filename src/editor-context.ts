/**
 * Editor context for sharing editor state across components
 */

import { createContext } from '@lit/context';
import type { Editor } from '@tiptap/core';

/**
 * Context value type for the editor context
 */
export interface EditorContextValue {
  editor: Editor | null;
  editorElement: HTMLElement | null;
}

/**
 * Editor context symbol for use with @lit/context
 */
export const editorContext = createContext<EditorContextValue>(Symbol('editor'));

