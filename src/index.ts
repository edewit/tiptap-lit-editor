/**
 * TipTap Lit Editor
 * A TipTap-based rich text editor built with Lit components
 */

// Main editor component
export { TipTapEditor } from './editor.js';

// Editor context for custom integrations
export { editorContext, type EditorContextValue } from './editor-context.js';

// Syntax highlighting theme (GitHub light/dark with auto-switching)
export { hljsTheme } from './hljs-theme.js';

// Menu components
export { BubbleMenu } from './components/bubble-menu.js';
export { TableBubbleMenu } from './components/table-bubble-menu.js';
export { FloatingMenu } from './components/floating-menu.js';
export { GutterMenu } from './components/gutter-menu.js';

// Prompt dialog
export { PromptDialog, showPrompt } from './components/prompt-dialog.js';

// Re-export TipTap core modules for convenience
export { Editor, Node, mergeAttributes, type AnyExtension } from '@tiptap/core';
export { default as StarterKit } from '@tiptap/starter-kit';
export { Markdown } from '@tiptap/markdown';
export { Image } from '@tiptap/extension-image';
export { Link } from '@tiptap/extension-link';
export { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
export { DragHandle } from '@tiptap/extension-drag-handle';
export { Table } from '@tiptap/extension-table';
export { TableRow } from '@tiptap/extension-table-row';
export { TableCell } from '@tiptap/extension-table-cell';
export { TableHeader } from '@tiptap/extension-table-header';
export { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';

// Re-export Lit context for custom integrations
export { createContext, ContextProvider, ContextConsumer, consume, provide } from '@lit/context';

// Re-export lowlight for code block customization
export { common, createLowlight } from 'lowlight';

