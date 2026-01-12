/**
 * Table controls component for TipTap editor
 * Lit component that shows buttons on the edge of the current row/column
 */

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Editor } from '@tiptap/core';
import { editorContext, type EditorContextValue } from '../editor-context.js';

interface CellPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TablePosition {
  top: number;
  left: number;
}

@customElement('tiptap-table-controls')
export class TableControls extends LitElement {
  @consume({ context: editorContext, subscribe: true })
  @state()
  private _editorContext?: EditorContextValue;

  @state() private _isInTable = false;
  @state() private _cellPosition: CellPosition | null = null;
  @state() private _tablePosition: TablePosition | null = null;
  @state() private _showColumnMenu = false;
  @state() private _showRowMenu = false;
  @state() private _isFirstRow = false;
  @state() private _isFirstColumn = false;

  private _updateFrame: number | null = null;
  private _lastUpdateTime = 0;
  private _updateThrottle = 50;

  static override styles = css`
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 100;
    }

    .table-controls {
      position: relative;
    }

    .control-button {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: 1px solid var(--tiptap-border-color, #e0e0e0);
      background: var(--tiptap-surface-color, #fff);
      color: var(--tiptap-text-color-secondary, #666);
      cursor: pointer;
      border-radius: var(--tiptap-border-radius-s, 4px);
      font-size: 12px;
      font-weight: bold;
      line-height: 1;
      pointer-events: auto;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: background 0.15s ease, color 0.15s ease;
    }

    .control-button:hover {
      background: var(--tiptap-hover-color, rgba(0, 0, 0, 0.05));
      color: var(--tiptap-text-color, #1a1a1a);
    }

    .control-button.is-open {
      background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
      color: var(--tiptap-primary-color, #1976d2);
    }

    .column-button {
      transform: translateX(-50%);
    }

    .row-button {
      transform: translateY(-50%);
    }

    .dropdown-menu {
      position: absolute;
      background: var(--tiptap-surface-color, #fff);
      border: 1px solid var(--tiptap-border-color, #e0e0e0);
      border-radius: var(--tiptap-border-radius-m, 8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: var(--tiptap-space-xs, 4px);
      min-width: 150px;
      pointer-events: auto;
      z-index: 101;
    }

    .column-menu {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 4px;
    }

    .row-menu {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 4px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: var(--tiptap-space-s, 8px);
      padding: var(--tiptap-space-xs, 4px) var(--tiptap-space-s, 8px);
      border: none;
      background: transparent;
      color: var(--tiptap-text-color, #1a1a1a);
      cursor: pointer;
      border-radius: var(--tiptap-border-radius-s, 4px);
      font-size: var(--tiptap-font-size-s, 14px);
      width: 100%;
      text-align: left;
    }

    .menu-item:hover {
      background: var(--tiptap-hover-color, rgba(0, 0, 0, 0.05));
    }

    .menu-item.danger {
      color: var(--tiptap-error-color, #d32f2f);
    }

    .menu-item.danger:hover {
      background: rgba(211, 47, 47, 0.1);
    }

    .menu-separator {
      height: 1px;
      background: var(--tiptap-border-color, #e0e0e0);
      margin: var(--tiptap-space-xs, 4px) 0;
    }

    .menu-item svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .menu-item:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .menu-item:disabled:hover {
      background: transparent;
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
    document.addEventListener('click', this._handleDocumentClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanupEditorUpdates();
    document.removeEventListener('click', this._handleDocumentClick);
  }

  override firstUpdated(): void {
    this._setupEditorUpdates();
  }

  override updated(): void {
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

        if ((now - this._lastUpdateTime) >= this._updateThrottle) {
          this._updatePosition();
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

  private _updatePosition(): void {
    if (!this.editor || !this.editorElement) {
      this._isInTable = false;
      return;
    }

    const isInTable = this.editor.isActive('table');

    if (!isInTable) {
      this._isInTable = false;
      this._cellPosition = null;
      this._tablePosition = null;
      this._showColumnMenu = false;
      this._showRowMenu = false;
      return;
    }

    this._isInTable = true;

    // Get the current cell element
    const { state } = this.editor;
    const { selection } = state;
    const $pos = selection.$anchor;

    // Find the cell node
    let cellNode: HTMLElement | null = null;
    let tableNode: HTMLElement | null = null;

    // Get the DOM node for the current position
    const domAtPos = this.editor.view.domAtPos($pos.pos);
    let node = domAtPos.node as HTMLElement;

    // Walk up to find the table cell and table
    while (node && node !== this.editorElement) {
      if (node.tagName === 'TD' || node.tagName === 'TH') {
        cellNode = node;
      }
      if (node.tagName === 'TABLE') {
        tableNode = node;
        break;
      }
      node = node.parentElement as HTMLElement;
    }

    if (!cellNode || !tableNode) {
      this._isInTable = false;
      return;
    }

    // Determine if we're in the first row or first column
    const row = cellNode.parentElement as HTMLTableRowElement;
    const cellIndex = Array.from(row.cells).indexOf(cellNode as HTMLTableCellElement);
    const rowIndex = Array.from(tableNode.querySelectorAll('tr')).indexOf(row);

    this._isFirstRow = rowIndex === 0;
    this._isFirstColumn = cellIndex === 0;

    // Get the editor container's position for relative calculations
    const editorRect = this.editorElement.getBoundingClientRect();
    const cellRect = cellNode.getBoundingClientRect();
    const tableRect = tableNode.getBoundingClientRect();
    const scrollTop = this.editorElement.scrollTop || 0;
    const scrollLeft = this.editorElement.scrollLeft || 0;

    this._cellPosition = {
      top: cellRect.top - editorRect.top + scrollTop,
      left: cellRect.left - editorRect.left + scrollLeft,
      width: cellRect.width,
      height: cellRect.height,
    };

    this._tablePosition = {
      top: tableRect.top - editorRect.top + scrollTop,
      left: tableRect.left - editorRect.left + scrollLeft,
    };
  }

  private _handleDocumentClick = (e: Event): void => {
    const path = e.composedPath();
    const isInsideControls = path.some(el => el === this);

    if (!isInsideControls) {
      this._showColumnMenu = false;
      this._showRowMenu = false;
    }
  };

  private _toggleColumnMenu(e: Event): void {
    e.stopPropagation();
    this._showColumnMenu = !this._showColumnMenu;
    this._showRowMenu = false;
  }

  private _toggleRowMenu(e: Event): void {
    e.stopPropagation();
    this._showRowMenu = !this._showRowMenu;
    this._showColumnMenu = false;
  }

  private _handleCommand(command: string): void {
    if (!this.editor) return;

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
      case 'toggleHeaderRow':
        this.editor.chain().focus().toggleHeaderRow().run();
        break;
      case 'deleteTable':
        this.editor.chain().focus().deleteTable().run();
        break;
    }

    this._showColumnMenu = false;
    this._showRowMenu = false;
  }

  override render() {
    if (!this._isInTable || !this._cellPosition || !this._tablePosition) {
      return html``;
    }

    const columnButtonStyle = `
      top: ${this._tablePosition.top - 24}px;
      left: ${this._cellPosition.left + this._cellPosition.width / 2}px;
    `;

    const rowButtonStyle = `
      top: ${this._cellPosition.top + this._cellPosition.height / 2}px;
      left: ${this._tablePosition.left - 24}px;
    `;

    return html`
      <div class="table-controls">
        <!-- Column button -->
        <div style="position: absolute; ${columnButtonStyle}">
          <button 
            class="control-button column-button ${this._showColumnMenu ? 'is-open' : ''}"
            @click=${this._toggleColumnMenu}
            title="Column options">
            ⋯
          </button>
          ${this._showColumnMenu ? html`
            <div class="dropdown-menu column-menu">
              <button class="menu-item" @click=${() => this._handleCommand('addColumnBefore')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add column before
              </button>
              <button class="menu-item" @click=${() => this._handleCommand('addColumnAfter')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add column after
              </button>
              <div class="menu-separator"></div>
              <button class="menu-item danger" @click=${() => this._handleCommand('deleteColumn')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete column
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Row button -->
        <div style="position: absolute; ${rowButtonStyle}">
          <button 
            class="control-button row-button ${this._showRowMenu ? 'is-open' : ''}"
            @click=${this._toggleRowMenu}
            title="Row options">
            ⋮
          </button>
          ${this._showRowMenu ? html`
            <div class="dropdown-menu row-menu">
              <button class="menu-item" @click=${() => this._handleCommand('addRowBefore')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add row above
              </button>
              <button class="menu-item" @click=${() => this._handleCommand('addRowAfter')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add row below
              </button>
              <div class="menu-separator"></div>
              <button 
                class="menu-item" 
                ?disabled=${!this._isFirstRow}
                @click=${() => this._isFirstRow && this._handleCommand('toggleHeaderRow')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                </svg>
                Toggle header row
              </button>
              <div class="menu-separator"></div>
              <button class="menu-item danger" @click=${() => this._handleCommand('deleteRow')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete row
              </button>
              <div class="menu-separator"></div>
              <button class="menu-item danger" @click=${() => this._handleCommand('deleteTable')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="7" y1="7" x2="17" y2="17"></line>
                  <line x1="17" y1="7" x2="7" y2="17"></line>
                </svg>
                Delete table
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tiptap-table-controls': TableControls;
  }
}
