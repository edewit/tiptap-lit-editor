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
import './heading-dropdown.js';

@customElement('tiptap-bubble-menu')
export class BubbleMenu extends LitElement {
    @consume({ context: editorContext, subscribe: true })
    @state()
    private _editorContext?: EditorContextValue;

    @state() private _isInList = false;
    @state() private _isInHeading = false;

    private _updateFrame: number | null = null;
    private _lastUpdateTime = 0;
    private _updateThrottle = 50; // Update at most every 50ms

    static override styles = css`
        :host {
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
        tiptap-heading-dropdown {
            display: none;
        }
        tiptap-heading-dropdown.show {
            display: inline-block;
        }
        .tiptap-menu-separator[data-show-on-heading] {
            display: none;
        }
        .tiptap-menu-separator[data-show-on-heading].show {
            display: block;
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
                <tiptap-heading-dropdown 
                    class="${this._isInHeading ? 'show' : ''}"
                    mode="toggle"
                ></tiptap-heading-dropdown>
                <div class="tiptap-menu-separator ${this._isInHeading ? 'show' : ''}" data-show-on-heading></div>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('bold') ? 'is-active' : ''}" 
                    data-command="bold" 
                    title="Bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('italic') ? 'is-active' : ''}" 
                    data-command="italic" 
                    title="Italic">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="4" x2="10" y2="4"></line>
                        <line x1="14" y1="20" x2="5" y2="20"></line>
                        <line x1="15" y1="4" x2="9" y2="20"></line>
                    </svg>
                </button>
                <div class="tiptap-menu-separator ${this._isInList ? 'show' : ''}" data-show-on-list></div>
                <button class="tiptap-menu-button" data-command="link" title="Link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                </button>
                <button class="tiptap-menu-button" data-command="image" title="Image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </button>
                <div class="tiptap-menu-separator ${this._isInList ? 'show' : ''}" data-show-on-list></div>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('bulletList') ? 'is-active' : ''} ${this._isInList ? 'show' : ''}" 
                    data-command="bulletList" 
                    data-show-on-list 
                    title="Bullet List">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <circle cx="4" cy="6" r="1" fill="currentColor"></circle>
                        <circle cx="4" cy="12" r="1" fill="currentColor"></circle>
                        <circle cx="4" cy="18" r="1" fill="currentColor"></circle>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button ${this._isCommandActive('orderedList') ? 'is-active' : ''} ${this._isInList ? 'show' : ''}" 
                    data-command="orderedList" 
                    data-show-on-list 
                    title="Ordered List">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="10" y1="6" x2="21" y2="6"></line>
                        <line x1="10" y1="12" x2="21" y2="12"></line>
                        <line x1="10" y1="18" x2="21" y2="18"></line>
                        <text x="4" y="7" font-size="6" fill="currentColor" stroke="none" font-weight="bold">1</text>
                        <text x="4" y="13" font-size="6" fill="currentColor" stroke="none" font-weight="bold">2</text>
                        <text x="4" y="19" font-size="6" fill="currentColor" stroke="none" font-weight="bold">3</text>
                    </svg>
                </button>
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
        this._isInHeading = this.editor.isActive('heading');
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
        this.requestUpdate();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-bubble-menu': BubbleMenu;
    }
}
