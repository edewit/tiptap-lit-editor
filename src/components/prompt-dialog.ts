import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

/**
 * A reusable prompt dialog component using native HTML dialog
 * Usage:
 *   const dialog = document.createElement('tiptap-prompt-dialog');
 *   dialog.prompt('Enter URL:', 'https://example.com').then(value => {
 *     if (value !== null) {
 *       // User confirmed with value
 *     }
 *   });
 */
@customElement('tiptap-prompt-dialog')
export class PromptDialog extends LitElement {
    @state() private _open = false;
    @state() private _message = '';
    @state() private _defaultValue = '';
    @state() private _inputValue = '';

    private _resolve: ((value: string | null) => void) | null = null;

    static override styles = css`
        :host {
            display: contents;
        }
        
        dialog {
            border: 1px solid var(--tiptap-border-color, #e0e0e0);
            border-radius: var(--tiptap-border-radius-m, 8px);
            padding: 0;
            min-width: 320px;
            max-width: 90vw;
            background: var(--tiptap-surface-color, #fff);
            color: var(--tiptap-text-color, #1a1a1a);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        dialog::backdrop {
            background: rgba(0, 0, 0, 0.4);
        }
        
        .dialog-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px;
        }
        
        .dialog-message {
            font-size: 14px;
            color: var(--tiptap-text-color, #1a1a1a);
            margin: 0;
            font-weight: 500;
        }
        
        .dialog-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--tiptap-border-color, #e0e0e0);
            border-radius: var(--tiptap-border-radius-s, 4px);
            font-size: 14px;
            font-family: inherit;
            background: var(--tiptap-surface-color, #fff);
            color: var(--tiptap-text-color, #1a1a1a);
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        
        .dialog-input:focus {
            border-color: var(--tiptap-primary-color, #1976d2);
            box-shadow: 0 0 0 2px var(--tiptap-primary-color-light, rgba(25, 118, 210, 0.2));
        }
        
        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 4px;
        }
        
        .dialog-button {
            padding: 8px 16px;
            border: none;
            border-radius: var(--tiptap-border-radius-s, 4px);
            font-size: 14px;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.15s ease, transform 0.1s ease;
        }
        
        .dialog-button:active {
            transform: scale(0.98);
        }
        
        .dialog-button-cancel {
            background: transparent;
            color: var(--tiptap-text-color-secondary, #666);
        }
        
        .dialog-button-cancel:hover {
            background: var(--tiptap-hover-color, rgba(0, 0, 0, 0.05));
        }
        
        .dialog-button-ok {
            background: var(--tiptap-primary-color, #1976d2);
            color: white;
        }
        
        .dialog-button-ok:hover {
            background: var(--tiptap-primary-color-dark, #1565c0);
        }
    `;

    /**
     * Shows a prompt dialog and returns a Promise that resolves with the user's input
     * @param message - The message to display
     * @param defaultValue - The default value for the input field
     * @returns Resolves with the input value if confirmed, null if cancelled
     */
    prompt(message: string, defaultValue = ''): Promise<string | null> {
        return new Promise((resolve) => {
            this._message = message;
            this._defaultValue = defaultValue;
            this._inputValue = defaultValue;
            this._resolve = resolve;
            this._open = true;
            this.requestUpdate();
            
            // Focus input after dialog opens
            this.updateComplete.then(() => {
                const dialog = this.shadowRoot?.querySelector('dialog');
                const input = this.shadowRoot?.querySelector('.dialog-input') as HTMLInputElement;
                if (dialog && !dialog.open) {
                    dialog.showModal();
                }
                if (input) {
                    input.focus();
                    input.select();
                }
            });
        });
    }

    private _handleConfirm(): void {
        if (this._resolve) {
            this._resolve(this._inputValue || null);
            this._resolve = null;
        }
        this._closeDialog();
    }

    private _handleCancel(): void {
        if (this._resolve) {
            this._resolve(null);
            this._resolve = null;
        }
        this._closeDialog();
    }

    private _closeDialog(): void {
        const dialog = this.shadowRoot?.querySelector('dialog');
        if (dialog) {
            dialog.close();
        }
        this._open = false;
        this._inputValue = '';
    }

    private _handleInput(e: Event): void {
        this._inputValue = (e.target as HTMLInputElement).value;
    }

    private _handleKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault();
            this._handleConfirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this._handleCancel();
        }
    }

    private _handleDialogClose(): void {
        // Handle native dialog close (e.g., Escape key)
        if (this._resolve) {
            this._resolve(null);
            this._resolve = null;
        }
        this._open = false;
    }

    override render() {
        return html`
            <dialog @close="${this._handleDialogClose}">
                <div class="dialog-content">
                    <p class="dialog-message">${this._message}</p>
                    <input 
                        type="text"
                        class="dialog-input"
                        .value="${this._inputValue}"
                        @input="${this._handleInput}"
                        @keydown="${this._handleKeyDown}"
                        placeholder="Enter value..."
                    />
                    <div class="dialog-actions">
                        <button 
                            class="dialog-button dialog-button-cancel"
                            @click="${this._handleCancel}"
                        >
                            Cancel
                        </button>
                        <button 
                            class="dialog-button dialog-button-ok"
                            @click="${this._handleConfirm}"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </dialog>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tiptap-prompt-dialog': PromptDialog;
    }
}

/**
 * Helper function to show a prompt dialog
 * Creates a singleton dialog instance and reuses it
 */
let dialogInstance: PromptDialog | null = null;

export function showPrompt(message: string, defaultValue = ''): Promise<string | null> {
    if (!dialogInstance) {
        dialogInstance = document.createElement('tiptap-prompt-dialog') as PromptDialog;
        document.body.appendChild(dialogInstance);
    }
    return dialogInstance.prompt(message, defaultValue);
}
