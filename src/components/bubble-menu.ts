/**
 * Bubble menu component for TipTap editor
 * Lit component that appears when text is selected
 */

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Editor } from '@tiptap/core';
import { editorContext, type EditorContextValue } from '../editor-context.js';
import { showPrompt } from './prompt-dialog.js';

@customElement('tiptap-bubble-menu')
export class BubbleMenu extends LitElement {
    @consume({ context: editorContext, subscribe: true })
    @state()
    private _editorContext?: EditorContextValue;

    @state() private _isInList = false;

    private _updateFrame: number | null = null;
    private _lastUpdateTime = 0;
    private _updateThrottle = 50; // Update at most every 50ms

    static override styles = css`
        :host {
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
        .tiptap-menu-separator[data-show-on-list] {
            display: none;
        }
        .tiptap-menu-separator[data-show-on-list].show {
            display: block;
        }
        .tiptap-menu-button[data-show-on-list] {
            display: none;
        }
        .tiptap-menu-button[data-show-on-list].show {
            display: flex;
        }
    `;

    get editor(): Editor | null {
        return this._editorContext?.editor ?? null;
    }

    get editorElement(): HTMLElement | null {
        return this._editorContext?.editorElement ?? null;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._setupEditorUpdates();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._cleanupEditorUpdates();
    }

    override firstUpdated(): void {
        this.addEventListener('click', this._handleClick.bind(this));
        this._setupEditorUpdates();
    }

    override updated(): void {
        // Re-setup updates when context changes
        if (this.editor) {
            this._setupEditorUpdates();
        }
    }

    private _setupEditorUpdates(): void {
        this._cleanupEditorUpdates();
        
        if (!this.editor) return;
        
        const updateLoop = (): void => {
            if (this.editor && this.isConnected) {
                const now = Date.now();
                const isVisible = this.offsetParent !== null && 
                                 this.style.display !== 'none' &&
                                 window.getComputedStyle(this).display !== 'none';
                
                if (isVisible && (now - this._lastUpdateTime) >= this._updateThrottle) {
                    this._updateButtonStates();
                    this._lastUpdateTime = now;
                }
                this._updateFrame = requestAnimationFrame(updateLoop);
            } else {
                this._cleanupEditorUpdates();
            }
        };
        
        this._updateFrame = requestAnimationFrame(updateLoop);
    }

    private _cleanupEditorUpdates(): void {
        if (this._updateFrame) {
            cancelAnimationFrame(this._updateFrame);
            this._updateFrame = null;
        }
    }

    override render() {
        return html`
            <div class="tiptap-menu">
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('bold') ? 'is-active' : ''}" 
                    data-command="bold" 
                    title="Bold">B</button>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('italic') ? 'is-active' : ''}" 
                    data-command="italic" 
                    title="Italic">I</button>
                <div class="tiptap-menu-separator ${this._isInList ? 'show' : ''}" data-show-on-list></div>
                <button class="tiptap-menu-button" data-command="link" title="Link">Link</button>
                <button class="tiptap-menu-button" data-command="image" title="Image">Image</button>
                <div class="tiptap-menu-separator ${this._isInList ? 'show' : ''}" data-show-on-list></div>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('bulletList') ? 'is-active' : ''} ${this._isInList ? 'show' : ''}" 
                    data-command="bulletList" 
                    data-show-on-list 
                    title="Bullet List">•</button>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('orderedList') ? 'is-active' : ''} ${this._isInList ? 'show' : ''}" 
                    data-command="orderedList" 
                    data-show-on-list 
                    title="Ordered List">1.</button>
            </div>
        `;
    }

    private _isCommandActive(command: string): boolean {
        if (!this.editor) return false;
        
        switch (command) {
            case 'bold':
                return this.editor.isActive('bold');
            case 'italic':
                return this.editor.isActive('italic');
            case 'bulletList':
                return this.editor.isActive('bulletList');
            case 'orderedList':
                return this.editor.isActive('orderedList');
            default:
                return false;
        }
    }

    private _updateButtonStates(): void {
        if (!this.editor) return;
        this._isInList = this.editor.isActive('bulletList') || this.editor.isActive('orderedList');
    }

    private _handleClick(e: Event): void {
        const path = e.composedPath();
        const button = path.find(el => 
            el instanceof HTMLElement && el.classList?.contains('tiptap-menu-button')
        ) as HTMLElement | undefined;
        
        if (!button || !this.editor) return;
        
        const command = button.dataset.command;
        
        if (command === 'bold') {
            this.editor.chain().focus().toggleBold().run();
        } else if (command === 'italic') {
            this.editor.chain().focus().toggleItalic().run();
        } else if (command === 'link') {
            const currentLinkAttrs = this.editor.getAttributes('link');
            const currentUrl = currentLinkAttrs.href || '';
            
            showPrompt('Enter URL:', currentUrl).then(url => {
                if (url) {
                    this.editor?.chain().focus().setLink({ href: url }).run();
                } else if (currentUrl) {
                    this.editor?.chain().focus().unsetLink().run();
                }
            });
        } else if (command === 'image') {
            showPrompt('Enter image URL:', '').then(url => {
                if (url) {
                    this.editor?.chain().focus().setImage({ src: url }).run();
                }
            });
        } else if (command === 'bulletList') {
            this.editor.chain().focus().toggleBulletList().run();
        } else if (command === 'orderedList') {
            this.editor.chain().focus().toggleOrderedList().run();
        }
        
        this._updateButtonStates();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-bubble-menu': BubbleMenu;
    }
}
