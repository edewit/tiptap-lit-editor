/**
 * Table bubble menu component for TipTap editor
 * Lit component that appears when cursor is in a table
 */

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Editor } from '@tiptap/core';
import { editorContext, type EditorContextValue } from '../editor-context.js';

@customElement('tiptap-table-bubble-menu')
export class TableBubbleMenu extends LitElement {
  @consume({ context: editorContext, subscribe: true })
  @state()
  private _editorContext?: EditorContextValue;

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
          this.requestUpdate();
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
                    class="tiptap-menu-button" 
                    data-command="addColumnBefore" 
                    title="Add Column Before">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="12" y2="12"></line>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button" 
                    data-command="addColumnAfter" 
                    title="Add Column After">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="12" y1="12" x2="16" y2="12"></line>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button" 
                    data-command="deleteColumn" 
                    title="Delete Column">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="3" x2="12" y2="21"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                </button>
                <div class="tiptap-menu-separator"></div>
                <button 
                    class="tiptap-menu-button" 
                    data-command="addRowBefore" 
                    title="Add Row Before">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button" 
                    data-command="addRowAfter" 
                    title="Add Row After">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                        <line x1="12" y1="12" x2="12" y2="16"></line>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button" 
                    data-command="deleteRow" 
                    title="Delete Row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                </button>
                <div class="tiptap-menu-separator"></div>
                <button 
                    class="tiptap-menu-button" 
                    data-command="deleteTable" 
                    title="Delete Table">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                        <line x1="7" y1="7" x2="17" y2="17"></line>
                        <line x1="17" y1="7" x2="7" y2="17"></line>
                    </svg>
                </button>
                <button 
                    class="tiptap-menu-button" 
                    data-command="toggleHeaderRow" 
                    title="Toggle Header Row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                        <rect x="3" y="3" width="18" height="6" rx="2" ry="2" fill="currentColor" opacity="0.2"></rect>
                    </svg>
                </button>
            </div>
        `;
  }

  private _handleClick(e: Event): void {
    const path = e.composedPath();
    const button = path.find(el =>
      el instanceof HTMLElement && el.classList?.contains('tiptap-menu-button')
    ) as HTMLElement | undefined;

    if (!button || !this.editor) return;

    const command = button.dataset.command;

    switch (command) {
      case 'addColumnBefore':
        this.editor.chain().focus().addColumnBefore().run();
        break;
      case 'addColumnAfter':
        this.editor.chain().focus().addColumnAfter().run();
        break;
      case 'deleteColumn':
        this.editor.chain().focus().deleteColumn().run();
        break;
      case 'addRowBefore':
        this.editor.chain().focus().addRowBefore().run();
        break;
      case 'addRowAfter':
        this.editor.chain().focus().addRowAfter().run();
        break;
      case 'deleteRow':
        this.editor.chain().focus().deleteRow().run();
        break;
      case 'deleteTable':
        this.editor.chain().focus().deleteTable().run();
        break;
      case 'toggleHeaderRow':
        this.editor.chain().focus().toggleHeaderRow().run();
        break;
    }

    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tiptap-table-bubble-menu': TableBubbleMenu;
  }
}
