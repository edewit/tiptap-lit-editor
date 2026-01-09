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
            background: var(--lumo-base-color);
            border: 1px solid var(--lumo-contrast-20pct);
            border-radius: var(--lumo-border-radius-m);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            min-width: 200px;
            max-height: 300px;
            overflow-y: auto;
            padding: var(--lumo-space-xs) 0;
        }
        .slash-menu-label {
            font-size: var(--lumo-font-size-xxs);
            padding: var(--lumo-space-s) var(--lumo-space-s) var(--lumo-space-xs);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .slash-menu-item {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s);
            padding: var(--lumo-space-xs) var(--lumo-space-s);
            cursor: pointer;
            transition: background-color 0.1s ease;
        }
        .slash-menu-item:hover,
        .slash-menu-item.is-selected {
            background: var(--lumo-primary-color-10pct);
        }
        .slash-menu-item.is-selected {
            background: var(--lumo-primary-color-10pct);
        }
        .slash-menu-item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            font-size: var(--lumo-font-size-s);
            font-weight: 600;
        }
        .slash-menu-item-label {
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-body-text-color);
        }
        .slash-menu-empty {
            padding: var(--lumo-space-m);
            text-align: center;
            font-size: var(--lumo-font-size-s);
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
