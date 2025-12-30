/**
 * Floating menu component for TipTap editor
 * Lit component that appears when the "+" button is clicked in the gutter menu
 */

import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Editor } from '@tiptap/core';
import { editorContext, type EditorContextValue } from '../editor-context.js';

@customElement('tiptap-floating-menu')
export class FloatingMenu extends LitElement {
    @consume({ context: editorContext, subscribe: true })
    @state()
    private _editorContext?: EditorContextValue;

    @property({ type: Boolean, reflect: true }) visible = false;

    private pos: number | null = null;

    static override styles = css`
        :host {
            position: absolute;
            z-index: 20;
            pointer-events: auto;
            display: none;
            bottom: 100%;
            left: 0;
            margin-bottom: 5px;
        }
        :host([visible]) {
            display: block;
        }
        .tiptap-menu {
            display: flex;
            gap: var(--lumo-space-xs);
            background: var(--lumo-base-color);
            border: 1px solid var(--lumo-contrast-20pct);
            border-radius: var(--lumo-border-radius-m);
            padding: var(--lumo-space-xs);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            margin: 0;
        }
        .tiptap-menu-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--lumo-space-xs) var(--lumo-space-s);
            border: none;
            background: transparent;
            color: var(--lumo-body-text-color);
            cursor: pointer;
            border-radius: var(--lumo-border-radius-s);
            font-size: var(--lumo-font-size-s);
            min-width: 32px;
            height: 32px;
        }
        .tiptap-menu-button:hover {
            background: var(--lumo-contrast-10pct);
        }
        .tiptap-menu-button.is-active {
            background: var(--lumo-primary-color-10pct);
            color: var(--lumo-primary-color);
        }
        .tiptap-menu-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .tiptap-menu-separator {
            width: 1px;
            background: var(--lumo-contrast-20pct);
            margin: var(--lumo-space-xs) 0;
        }
    `;

    get editor(): Editor | null {
        return this._editorContext?.editor ?? null;
    }

    get editorElement(): HTMLElement | null {
        return this._editorContext?.editorElement ?? null;
    }

    override firstUpdated(): void {
        this.addEventListener('click', this._handleClick.bind(this));
        this.addEventListener('mouseenter', this._handleMouseEnter.bind(this));
        this.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
    }

    override render() {
        return html`
            <div class="tiptap-menu">
                <button class="tiptap-menu-button" data-command="heading" data-level="1" title="Heading 1">H1</button>
                <button class="tiptap-menu-button" data-command="heading" data-level="2" title="Heading 2">H2</button>
                <button class="tiptap-menu-button" data-command="heading" data-level="3" title="Heading 3">H3</button>
                <button class="tiptap-menu-button" data-command="heading" data-level="4" title="Heading 4">H4</button>
                <button class="tiptap-menu-button" data-command="heading" data-level="5" title="Heading 5">H5</button>
                <button class="tiptap-menu-button" data-command="heading" data-level="6" title="Heading 6">H6</button>
                <div class="tiptap-menu-separator"></div>
                <button class="tiptap-menu-button" data-command="bulletList" title="Bullet List">• List</button>
                <button class="tiptap-menu-button" data-command="orderedList" title="Ordered List">1. List</button>
                <div class="tiptap-menu-separator"></div>
                <button class="tiptap-menu-button" data-command="codeBlock" title="Code Block">Code</button>
            </div>
        `;
    }

    /**
     * Position the floating menu relative to a block element
     * Now uses CSS positioning relative to parent gutter menu
     */
    position(e: MouseEvent): void {
        if (!this.editor || !this.editorElement) return;
        
        const coords = this.editor.view.posAtCoords({
            left: e.clientX,
            top: e.clientY
        });
        if (coords) {
            this.pos = coords.pos;
        }

        this.show();
    }

    /**
     * Show the floating menu
     */
    show(): void {
        this.visible = true;
    }

    /**
     * Hide the floating menu
     */
    hide(): void {
        this.visible = false;
    }

    /**
     * Toggle the floating menu visibility
     */
    toggle(e: MouseEvent): void {
        if (this.visible) {
            this.hide();
        } else {
            this.position(e);
        }
    }

    /**
     * Handle button clicks in the menu
     */
    private _handleClick(e: Event): void {
        const path = e.composedPath();
        const button = path.find(el => 
            el instanceof HTMLElement && el.classList?.contains('tiptap-menu-button')
        ) as HTMLElement | undefined;
        
        if (!button || !this.editor) return;

        const command = button.dataset.command;
        const level = button.dataset.level;

        const pos = this.pos;
        if (pos === null) return;

        if (command === 'bulletList') {
            this.editor.chain()
                .focus()
                .insertContentAt(pos, {
                    type: 'bulletList',
                    content: [{
                        type: 'listItem',
                        content: [{
                            type: 'paragraph',
                            content: []
                        }]
                    }]
                })
                .setTextSelection(pos + 1)
                .run();
        } else if (command === 'orderedList') {
            this.editor.chain()
                .focus()
                .insertContentAt(pos, {
                    type: 'orderedList',
                    content: [{
                        type: 'listItem',
                        content: [{
                            type: 'paragraph',
                            content: []
                        }]
                    }]
                })
                .setTextSelection(pos + 1)
                .run();
        } else if (command === 'codeBlock') {
            this.editor.chain()
                .focus()
                .insertContentAt(pos, {
                    type: 'codeBlock',
                    content: []
                })
                .setTextSelection(pos + 1)
                .run();
        } else if (command === 'heading' && level) {
            this.editor.chain()
                .focus()
                .insertContentAt(pos, { 
                    type: command, 
                    attrs: { level: parseInt(level) } 
                })
                .setTextSelection(pos + 1)
                .run();
        }

        this.hide();
    }

    /**
     * Handle mouse enter - keep menu visible
     */
    private _handleMouseEnter(): void {
        this.dispatchEvent(new CustomEvent('menu-enter', { bubbles: true, composed: true }));
    }

    /**
     * Handle mouse leave - hide menu
     */
    private _handleMouseLeave(): void {
        this.hide();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-floating-menu': FloatingMenu;
    }
}
