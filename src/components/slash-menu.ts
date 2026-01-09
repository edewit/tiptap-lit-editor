/**
 * Slash menu component for TipTap editor
 * Lit component that appears when typing "/" at the start of a line
 * Provides a filterable list of block types to insert
 */

import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { BlockTypeItem } from './slash-command';

@customElement('qwc-slash-menu')
export class SlashMenu extends LitElement {
    @property({ type: Array })
    items: BlockTypeItem[] = [];

    @state()
    selectedIndex = 0;

    @property({ type: String })
    query = '';

    static override styles = css`
        :host {
            display: block;
        }
        .slash-menu {
            background: var(--tiptap-surface-color, #fff);
            border: 1px solid var(--tiptap-border-color, #e0e0e0);
            border-radius: var(--tiptap-border-radius-m, 8px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            min-width: 200px;
            max-height: 300px;
            overflow-y: auto;
            padding: var(--tiptap-space-xs, 4px) 0;
        }
        .slash-menu-label {
            font-size: var(--tiptap-font-size-xxs, 11px);
            padding: var(--tiptap-space-s, 8px) var(--tiptap-space-s, 8px) var(--tiptap-space-xs, 4px);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .slash-menu-item {
            display: flex;
            align-items: center;
            gap: var(--tiptap-space-s, 8px);
            padding: var(--tiptap-space-xs, 4px) var(--tiptap-space-s, 8px);
            cursor: pointer;
            transition: background-color 0.1s ease;
        }
        .slash-menu-item:hover,
        .slash-menu-item.is-selected {
            background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
        }
        .slash-menu-item.is-selected {
            background: var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.1));
        }
        .slash-menu-item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            font-size: var(--tiptap-font-size-s, 14px);
            font-weight: 600;
        }
        .slash-menu-item-label {
            font-size: var(--tiptap-font-size-s, 14px);
            color: var(--tiptap-text-color, #1a1a1a);
        }
        .slash-menu-empty {
            padding: var(--tiptap-space-m, 16px);
            text-align: center;
            font-size: var(--tiptap-font-size-s, 14px);
        }
    `;

    protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
        if (changedProperties.has('items')) {
            // Reset selection when items change
            this.selectedIndex = 0;
        }
    }

    override render() {
        if (!this.items || this.items.length === 0) {
            return html`
                <div class="slash-menu">
                    <div class="slash-menu-empty">No matching blocks</div>
                </div>
            `;
        }

        return html`
            <div class="slash-menu">
                <div class="slash-menu-label">Style</div>
                ${this.items.map((item, index) => html`
                    <div 
                        class="slash-menu-item ${index === this.selectedIndex ? 'is-selected' : ''}"
                        @click="${() => this._selectItem(index)}"
                        @mouseenter="${() => this._hoverItem(index)}"
                    >
                        <span class="slash-menu-item-icon">${item.icon}</span>
                        <span class="slash-menu-item-label">${item.label}</span>
                    </div>
                `)}
            </div>
        `;
    }

    private _selectItem(index: number): void {
        const item = this.items[index];
        if (item) {
            this.dispatchEvent(new CustomEvent('item-selected', {
                detail: { item },
                bubbles: true,
                composed: true
            }));
        }
    }

    private _hoverItem(index: number): void {
        this.selectedIndex = index;
    }

    /**
     * Handle keyboard navigation
     * @param event - The keyboard event
     * @returns Whether the event was handled
     */
    onKeyDown(event: KeyboardEvent): boolean {
        if (event.key === 'ArrowUp') {
            this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
            this._scrollToSelected();
            return true;
        }

        if (event.key === 'ArrowDown') {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
            this._scrollToSelected();
            return true;
        }

        if (event.key === 'Enter') {
            this._selectItem(this.selectedIndex);
            return true;
        }

        return false;
    }

    private _scrollToSelected(): void {
        this.updateComplete.then(() => {
            const selectedEl = this.shadowRoot?.querySelector('.slash-menu-item.is-selected');
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'qwc-slash-menu': SlashMenu;
    }
}
