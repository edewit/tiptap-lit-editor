/**
 * Base TipTap Editor component built with Lit
 * Provides a complete editing experience with gutter menu, floating menu, and bubble menu
 */

import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { Editor, type AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import { DragHandle } from '@tiptap/extension-drag-handle';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import { editorContext, type EditorContextValue } from './editor-context.js';
import { hljsTheme } from './hljs-theme.js';
import './components/bubble-menu.js';
import './components/floating-menu.js';
import './components/gutter-menu.js';

// Type for editor with markdown extension
interface MarkdownEditor extends Editor {
    getMarkdown(): string;
}

@customElement('tiptap-editor')
export class TipTapEditor extends LitElement {
    @provide({ context: editorContext })
    @state()
    private _editorContext: EditorContextValue = { editor: null, editorElement: null };

    @property({ type: String }) content = '';
    @property({ type: Boolean }) markdown = false;
    @property({ type: Boolean }) editable = true;
    @property({ type: Array }) extensions: AnyExtension[] = [];
    @property({ type: String }) placeholder = 'Start writing...';
    
    @state() private _editedContent = '';

    private _editor: Editor | null = null;
    private _editorElement: HTMLElement | null = null;
    private _isInitializing = false;

    static override styles = [
        hljsTheme,
        css`
        :host {
            display: block;
            height: 100%;
        }
        .editor-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
            position: relative;
        }
        .tiptap-editor {
            flex: 1;
            width: 100%;
            min-height: 0;
            padding: var(--lumo-space-m, 1rem);
            border-radius: var(--lumo-border-radius-m, 0.5rem);
            border: 1px solid var(--lumo-contrast-20pct, #ccc);
            background: var(--lumo-contrast-5pct, #f5f5f5);
            box-sizing: border-box;
            overflow-y: auto;
            position: relative;
        }
        .tiptap-editor .tiptap {
            padding-left: 50px;
        }
        .tiptap-editor:focus {
            outline: none;
            border-color: var(--lumo-primary-color, #1976d2);
            box-shadow: 0 0 0 2px var(--lumo-primary-color-10pct, rgba(25, 118, 210, 0.1));
        }
        .tiptap-editor:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .tiptap-editor p {
            margin: 1em 0;
        }
        .tiptap-editor blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 2px solid var(--lumo-contrast-20pct, #ccc);
        }
        .tiptap-editor table {
            border-collapse: collapse;
            margin: 1em 0;
            width: 100%;
            border: 1px solid var(--lumo-contrast-20pct, #ccc);
            border-radius: var(--lumo-border-radius-m, 0.5rem);
            overflow: hidden;
        }
        .tiptap-editor table td,
        .tiptap-editor table th {
            border: 1px solid var(--lumo-contrast-20pct, #ccc);
            padding: var(--lumo-space-xs, 0.25rem) var(--lumo-space-s, 0.5rem);
            text-align: left;
        }
        .tiptap-editor table th {
            background: var(--lumo-contrast-10pct, #eee);
            font-weight: 600;
        }
        .tiptap-editor table tr:nth-child(even) {
            background: var(--lumo-contrast-5pct, #f5f5f5);
        }
        .tiptap-editor p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: var(--lumo-contrast-60pct, #666);
            pointer-events: none;
            height: 0;
        }
        .tiptap > pre {
            border: 1px solid var(--lumo-contrast-20pct, #ccc);
            border-radius: var(--lumo-border-radius-m, 0.5rem);
            padding: 1em;
            margin: 1em 0;
            overflow-x: auto;
            font-family: var(--lumo-font-family-monospace, monospace);
            font-size: 0.9em;
            line-height: 1.5;
        }
        .tiptap > pre code {
            background: transparent;
            border: none;
            padding: 0;
            font-size: inherit;
            color: inherit;
        }
        pre code {
            background: transparent;
            border: none;
            padding: 0;
        }
    `];

    override firstUpdated(): void {
        this._tryInitializeEditor();
    }

    override updated(changedProperties: PropertyValues): void {
        if (!this._editor) {
            this._tryInitializeEditor();
        }

        if (changedProperties.has('content') && this._editor && !this._editor.isDestroyed) {
            const currentContent = this.markdown
                ? (this._editor as MarkdownEditor).getMarkdown()
                : this._editor.getHTML();

            if (currentContent !== this.content) {
                this._isInitializing = true;
                this._editor.commands.setContent(this.content, { 
                    emitUpdate: false,
                    contentType: this.markdown ? 'markdown' : 'html'
                });
                this._editedContent = this.content;
                requestAnimationFrame(() => {
                    this._isInitializing = false;
                });
            }
        }

        if (changedProperties.has('editable') && this._editor && !this._editor.isDestroyed) {
            this._editor.setEditable(this.editable);
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this._editor && !this._editor.isDestroyed) {
            this._editor.destroy();
            this._editor = null;
        }
    }

    private _tryInitializeEditor(): void {
        const editorElement = this.shadowRoot?.querySelector('.tiptap-editor') as HTMLElement | null;
        if (!editorElement || this._editor) {
            return;
        }

        const bubbleMenuContainer = this.shadowRoot?.querySelector('tiptap-bubble-menu') as HTMLElement | null;
        if (!bubbleMenuContainer) {
            requestAnimationFrame(() => {
                this._tryInitializeEditor();
            });
            return;
        }

        this._editorElement = editorElement;
        this._isInitializing = true;

        // Configure code block with syntax highlighting
        const ConfCodeBlockLowlight = CodeBlockLowlight.configure({
            lowlight: createLowlight(common)
        });

        // Build base extensions based on markdown mode
        const baseExtensions: AnyExtension[] = this.markdown
            ? [
                StarterKit.configure({ 
                    link: false, 
                    codeBlock: false 
                }),
                Markdown
            ]
            : [StarterKit.configure({ link: false })];

        // Build full extensions array
        const extensions: AnyExtension[] = [
            ...baseExtensions,
            ...(this.markdown ? [Table, TableRow, TableHeader, TableCell, ConfCodeBlockLowlight] : []),
            Image,
            Link.configure({
                openOnClick: false,
            }),
            DragHandle.configure({
                render: () => this.shadowRoot?.getElementById('gutter-menu') as HTMLElement,
            }),
            ...this.extensions,
        ];

        // Add bubble menu extension
        if (bubbleMenuContainer) {
            extensions.push(BubbleMenuExtension.configure({
                element: bubbleMenuContainer,
                shouldShow: ({ state: { selection } }) => !selection.empty,
            }));
        }

        this._editor = new Editor({
            element: editorElement,
            extensions: extensions,
            content: this.content || '',
            contentType: this.markdown ? 'markdown' : 'html',
            editable: this.editable,
            onUpdate: ({ editor }) => {
                if (this.markdown) {
                    this._editedContent = (editor as MarkdownEditor).getMarkdown();
                } else {
                    this._editedContent = editor.getHTML();
                }
                
                if (!this._isInitializing) {
                    this.dispatchEvent(new CustomEvent('content-changed', {
                        bubbles: true,
                        composed: true,
                        detail: { content: this._editedContent }
                    }));
                }

                this.requestUpdate();
            },
            editorProps: {
                attributes: {
                    'data-placeholder': this.placeholder,
                    class: 'tiptap-editor'
                },
            },
            onSelectionUpdate: ({ editor }) => {
                this.dispatchEvent(new CustomEvent('selection-changed', {
                    bubbles: true,
                    composed: true,
                    detail: { 
                        selection: editor.state.selection,
                        editor: editor
                    }
                }));
                this.requestUpdate();
            },
        });

        this._editor.commands.setTextSelection(this._editor.state.doc.content.size);
        // Update the context with the editor instance
        this._editorContext = { editor: this._editor, editorElement: this._editorElement };

        requestAnimationFrame(() => {
            setTimeout(() => {
                this._isInitializing = false;
            }, 200);
        });
    }

    override render() {
        return html`
            <div class="editor-wrapper">
                <div class="tiptap-editor">
                    <tiptap-gutter-menu id="gutter-menu" style="visibility: hidden;">
                        <tiptap-floating-menu></tiptap-floating-menu>
                    </tiptap-gutter-menu>
                    <tiptap-bubble-menu style="visibility: hidden;"></tiptap-bubble-menu>
                </div>
            </div>
        `;
    }

    /**
     * Get the current content
     * @returns The current content (HTML or Markdown based on mode)
     */
    getContent(): string {
        if (this._editor && !this._editor.isDestroyed) {
            return this.markdown ? (this._editor as MarkdownEditor).getMarkdown() : this._editor.getHTML();
        }
        return this._editedContent;
    }

    /**
     * Set the content
     * @param content - The content to set
     */
    setContent(content: string): void {
        if (this._editor && !this._editor.isDestroyed) {
            this._editor.commands.setContent(content, {
                emitUpdate: false,
                contentType: this.markdown ? 'markdown' : 'html'
            });
        }
        this._editedContent = content;
    }

    /**
     * Get the TipTap editor instance
     * @returns The TipTap editor instance
     */
    getEditor(): Editor | null {
        return this._editor;
    }

    /**
     * Focus the editor
     */
    focus(): void {
        if (this._editor && !this._editor.isDestroyed) {
            this._editor.commands.focus();
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-editor': TipTapEditor;
    }
}
