/**
 * Heading dropdown component for TipTap editor
 * Reusable dropdown for selecting heading levels (H1-H6) or paragraph
 */

import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Editor } from '@tiptap/core';
import { editorContext, type EditorContextValue } from '../editor-context.js';

export type HeadingDropdownMode = 'insert' | 'toggle';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@customElement('tiptap-heading-dropdown')
export class HeadingDropdown extends LitElement {
    @consume({ context: editorContext, subscribe: true })
    @state()
    private _editorContext?: EditorContextValue;

    /** Whether the dropdown is open */
    @property({ type: Boolean, reflect: true }) open = false;

    /** Mode: 'insert' for floating menu, 'toggle' for bubble menu */
    @property({ type: String }) mode: HeadingDropdownMode = 'toggle';

    /** Position to insert content at (used in 'insert' mode) */
    @property({ type: Number }) insertPos: number | null = null;

    static override styles = css`
        :host {
            position: relative;
            display: inline-block;
        }
        
        .dropdown-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tiptap-space-xs, 4px);
            padding: var(--tiptap-space-xs, 4px) var(--tiptap-space-s, 8px);
            border: none;
            background: transparent;
            color: var(--tiptap-text-color, #1a1a1a);
            cursor: pointer;
            border-radius: var(--tiptap-border-radius-s, 4px);
            font-size: var(--tiptap-font-size-s, 14px);
            min-width: 80px;
            height: 32px;
        }
        
        .dropdown-trigger:hover {
            background: var(--tiptap-hover-color, rgba(0, 0, 0, 0.05));
        }
        
        .dropdown-trigger.is-active {
            background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
            color: var(--tiptap-primary-color, #1976d2);
        }
        
        .dropdown-arrow {
            width: 12px;
            height: 12px;
            transition: transform 0.2s;
        }
        
        :host([open]) .dropdown-arrow {
            transform: rotate(180deg);
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 100;
            display: none;
            flex-direction: column;
            min-width: 120px;
            background: var(--tiptap-surface-color, #fff);
            border: 1px solid var(--tiptap-border-color, #e0e0e0);
            border-radius: var(--tiptap-border-radius-m, 8px);
            padding: var(--tiptap-space-xs, 4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-top: 4px;
        }
        
        :host([open]) .dropdown-menu {
            display: flex;
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            padding: var(--tiptap-space-xs, 4px) var(--tiptap-space-s, 8px);
            border: none;
            background: transparent;
            color: var(--tiptap-text-color, #1a1a1a);
            cursor: pointer;
            border-radius: var(--tiptap-border-radius-s, 4px);
            font-size: var(--tiptap-font-size-s, 14px);
            text-align: left;
            white-space: nowrap;
        }
        
        .dropdown-item:hover {
            background: var(--tiptap-hover-color, rgba(0, 0, 0, 0.05));
        }
        
        .dropdown-item.is-active {
            background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
            color: var(--tiptap-primary-color, #1976d2);
        }
        
        .dropdown-item[data-level="1"] { font-size: 1.4em; font-weight: bold; }
        .dropdown-item[data-level="2"] { font-size: 1.3em; font-weight: bold; }
        .dropdown-item[data-level="3"] { font-size: 1.2em; font-weight: bold; }
        .dropdown-item[data-level="4"] { font-size: 1.1em; font-weight: bold; }
        .dropdown-item[data-level="5"] { font-size: 1em; font-weight: bold; }
        .dropdown-item[data-level="6"] { font-size: 0.9em; font-weight: bold; }
        
        .dropdown-separator {
            height: 1px;
            background: var(--tiptap-border-color, #e0e0e0);
            margin: var(--tiptap-space-xs, 4px) 0;
        }
    `;

    get editor(): Editor | null {
        return this._editorContext?.editor ?? null;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener('click', this._handleDocumentClick);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener('click', this._handleDocumentClick);
    }

    private _handleDocumentClick = (e: Event): void => {
        // Close dropdown when clicking outside
        if (this.open && !this.contains(e.target as Node)) {
            this.open = false;
        }
    };

    private _getCurrentHeading(): number | null {
        if (!this.editor) return null;
        
        for (let level = 1; level <= 6; level++) {
            if (this.editor.isActive('heading', { level })) {
                return level;
            }
        }
        return null;
    }

    private _getDisplayText(): string {
        const level = this._getCurrentHeading();
        if (level) {
            return `H${level}`;
        }
        return 'Text';
    }

    private _toggleDropdown(e: Event): void {
        e.stopPropagation();
        this.open = !this.open;
    }

    private _selectHeading(level: HeadingLevel): void {
        if (!this.editor) return;
        
        if (this.mode === 'insert' && this.insertPos !== null) {
            // Insert mode: insert a new heading at the specified position
            this.editor.chain()
                .focus()
                .insertContentAt(this.insertPos, { 
                    type: 'heading', 
                    attrs: { level } 
                })
                .setTextSelection(this.insertPos + 1)
                .run();
            
            this.dispatchEvent(new CustomEvent('heading-inserted', {
                bubbles: true,
                composed: true,
                detail: { level }
            }));
        } else {
            // Toggle mode: change current block to heading
            this.editor.chain().focus().toggleHeading({ level }).run();
        }
        
        this.open = false;
    }

    private _selectParagraph(): void {
        if (!this.editor) return;
        
        if (this.mode === 'insert' && this.insertPos !== null) {
            // Insert mode: insert a new paragraph at the specified position
            this.editor.chain()
                .focus()
                .insertContentAt(this.insertPos, { 
                    type: 'paragraph'
                })
                .setTextSelection(this.insertPos + 1)
                .run();
            
            this.dispatchEvent(new CustomEvent('paragraph-inserted', {
                bubbles: true,
                composed: true
            }));
        } else {
            // Toggle mode: change current block to paragraph
            this.editor.chain().focus().setParagraph().run();
        }
        
        this.open = false;
    }

    override render() {
        const currentLevel = this._getCurrentHeading();
        const hasActiveHeading = currentLevel !== null;
        
        return html`
            <button 
                class="dropdown-trigger ${hasActiveHeading ? 'is-active' : ''}"
                @click="${this._toggleDropdown}"
                title="Change text style"
            >
                <span>${this._getDisplayText()}</span>
                <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            
            <div class="dropdown-menu">
                <button 
                    class="dropdown-item ${!hasActiveHeading ? 'is-active' : ''}"
                    @click="${this._selectParagraph}"
                >
                    Paragraph
                </button>
                <div class="dropdown-separator"></div>
                ${([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((level) => html`
                    <button 
                        class="dropdown-item ${currentLevel === level ? 'is-active' : ''}"
                        data-level="${level}"
                        @click="${() => this._selectHeading(level)}"
                    >
                        Heading ${level}
                    </button>
                `)}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-heading-dropdown': HeadingDropdown;
    }
}
