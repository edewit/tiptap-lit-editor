/**
 * Gutter menu Lit component for TipTap editor
 * Appears in the left gutter on hover for each paragraph/block
 * Provides "+" button for creating new blocks and drag handle for reordering
 */

import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './floating-menu.js';
import type { FloatingMenu } from './floating-menu.js';

@customElement('tiptap-gutter-menu')
export class GutterMenu extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-direction: row;
            gap: 2px;
            position: relative;
            transition-property: top;
            transition-duration: .2s;
            transition-timing-function: ease-out;
        }
        .gutter-menu-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            padding: 0;
            border: 1px solid var(--tiptap-border-color, #e0e0e0);
            background: var(--tiptap-surface-color, #fff);
            color: var(--tiptap-text-color, #1a1a1a);
            cursor: pointer;
            border-radius: var(--tiptap-border-radius-s, 4px);
            font-size: var(--tiptap-font-size-s, 14px);
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .gutter-menu-button:hover {
            background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
            border-color: var(--tiptap-primary-color, #1976d2);
            color: var(--tiptap-primary-color, #1976d2);
        }
        .gutter-add-button {
            font-size: var(--tiptap-font-size-l, 18px);
            line-height: 1;
        }
        .gutter-drag-button {
            font-size: var(--tiptap-font-size-xs, 12px);
            line-height: 1.2;
            cursor: grab;
        }
        .gutter-drag-button:active {
            cursor: grabbing;
        }
        ::slotted(tiptap-floating-menu) {
            position: absolute;
            bottom: 100%;
            left: 0;
            margin-bottom: 5px;
        }
    `;

    override firstUpdated(): void {
        const addButton = this.shadowRoot?.querySelector('.gutter-add-button');

        if (addButton) {
            addButton.addEventListener('click', ((e: Event) => this._handleAddClick(e as MouseEvent)) as EventListener);
        }
    }

    get floatingMenu(): FloatingMenu | null {
        return this.querySelector('tiptap-floating-menu');
    }

    override render() {
        return html`
            <button class="gutter-menu-button gutter-add-button" title="Add block">+</button>
            <button class="gutter-menu-button gutter-drag-button" title="Drag to reorder">⋮⋮</button>
            <slot></slot>
        `;
    }

    /**
     * Handle add button click
     */
    private _handleAddClick(e: MouseEvent): void {
        e.stopPropagation();
        if (this.floatingMenu) {
            this.floatingMenu.toggle(e);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-gutter-menu': GutterMenu;
    }
}
