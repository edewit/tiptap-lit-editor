/**
 * Floating menu component for TipTap editor
 * Lit component that appears when the "+" button is clicked in the gutter menu
 */

import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Editor } from '@tiptap/core';
import { editorContext, type EditorContextValue } from '../editor-context.js';
import './heading-dropdown.js';

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
            gap: var(--tiptap-space-xs, 4px);
            background: var(--tiptap-surface-color, #fff);
            border: 1px solid var(--tiptap-border-color, #e0e0e0);
            border-radius: var(--tiptap-border-radius-m, 8px);
            padding: var(--tiptap-space-xs, 4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            margin: 0;
        }
        .tiptap-menu-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--tiptap-space-xs, 4px) var(--tiptap-space-s, 8px);
            border: none;
            background: transparent;
            color: var(--tiptap-text-color, #1a1a1a);
            cursor: pointer;
            border-radius: var(--tiptap-border-radius-s, 4px);
            font-size: var(--tiptap-font-size-s, 14px);
            min-width: 32px;
            height: 32px;
        }
        .tiptap-menu-button:hover {
            background: var(--tiptap-hover-color, rgba(0, 0, 0, 0.05));
        }
        .tiptap-menu-button.is-active {
            background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
            color: var(--tiptap-primary-color, #1976d2);
        }
        .tiptap-menu-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .tiptap-menu-separator {
            width: 1px;
            background: var(--tiptap-border-color, #e0e0e0);
            margin: var(--tiptap-space-xs, 4px) 0;
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
                <tiptap-heading-dropdown 
                    mode="insert" 
                    .insertPos="${this.pos}"
                    @heading-inserted="${this._onContentInserted}"
                    @paragraph-inserted="${this._onContentInserted}"
                ></tiptap-heading-dropdown>
                <div class="tiptap-menu-separator"></div>
                <button class="tiptap-menu-button" data-command="bulletList" title="Bullet List">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <circle cx="4" cy="6" r="1" fill="currentColor"></circle>
                        <circle cx="4" cy="12" r="1" fill="currentColor"></circle>
                        <circle cx="4" cy="18" r="1" fill="currentColor"></circle>
                    </svg>
                </button>
                <button class="tiptap-menu-button" data-command="orderedList" title="Ordered List">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="10" y1="6" x2="21" y2="6"></line>
                        <line x1="10" y1="12" x2="21" y2="12"></line>
                        <line x1="10" y1="18" x2="21" y2="18"></line>
                        <text x="4" y="7" font-size="6" fill="currentColor" stroke="none" font-weight="bold">1</text>
                        <text x="4" y="13" font-size="6" fill="currentColor" stroke="none" font-weight="bold">2</text>
                        <text x="4" y="19" font-size="6" fill="currentColor" stroke="none" font-weight="bold">3</text>
                    </svg>
                </button>
                <div class="tiptap-menu-separator"></div>
                <button class="tiptap-menu-button" data-command="codeBlock" title="Code Block">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                </button>
            </div>
        `;
    }

    private _onContentInserted(): void {
        this.hide();
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
