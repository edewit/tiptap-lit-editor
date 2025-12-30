import { LitElement, html, css, render } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@vaadin/dialog';
import '@vaadin/text-field';
import '@vaadin/button';
import '@vaadin/icon';

/**
 * A reusable prompt dialog component based on Vaadin Dialog
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
    @state() private _tempInputValue = '';

    private _resolve: ((value: string | null) => void) | null = null;
    private _boundHandleClick: ((e: Event) => void) | null = null;
    private _boundHandleValueChanged: ((e: Event) => void) | null = null;
    private _boundHandleKeyDown: ((e: KeyboardEvent) => void) | null = null;

    static override styles = css`
        vaadin-dialog {
            --vaadin-dialog-content-padding: var(--lumo-space-m);
        }
        .dialog-content {
            display: flex;
            flex-direction: column;
            gap: var(--lumo-space-m);
            min-width: 300px;
        }
        .dialog-message {
            font-size: var(--lumo-font-size-m);
            color: var(--lumo-body-text-color);
            margin: 0;
        }
        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--lumo-space-s);
            margin-top: var(--lumo-space-s);
        }
        vaadin-text-field {
            width: 100%;
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
            this._tempInputValue = defaultValue;
            this._resolve = resolve;
            this._open = true;
            this.requestUpdate();
        });
    }

    private _handleConfirm(): void {
        if (this._resolve) {
            this._resolve(this._tempInputValue || null);
            this._inputValue = this._tempInputValue;
            this._resolve = null;
        }
        this._open = false;
    }

    private _handleCancel(): void {
        if (this._resolve) {
            this._resolve(null);
            this._tempInputValue = this._defaultValue;
            this._inputValue = this._defaultValue;
            this._resolve = null;
        }
        this._open = false;
    }

    private _dialogRenderer = (root: HTMLElement): void => {
        if (root) {
            const oldContent = root.querySelector('.dialog-content');
            if (oldContent && this._boundHandleClick) {
                root.removeEventListener('click', this._boundHandleClick);
            }
            if (oldContent && this._boundHandleValueChanged) {
                root.removeEventListener('value-changed', this._boundHandleValueChanged);
            }
            if (oldContent && this._boundHandleKeyDown) {
                root.removeEventListener('keydown', this._boundHandleKeyDown as EventListener);
            }
            
            this._boundHandleClick = this._handleClick.bind(this);
            this._boundHandleValueChanged = this._handleValueChanged.bind(this);
            this._boundHandleKeyDown = this._handleKeyDown.bind(this);
            
            render(html`
                <div class="dialog-content">
                    <p class="dialog-message">${this._message}</p>
                    <vaadin-text-field
                        id="prompt-input"
                        .value="${this._tempInputValue}"
                        placeholder="Enter value...">
                    </vaadin-text-field>
                    <div class="dialog-actions">
                        <vaadin-button
                            id="cancel-button"
                            theme="tertiary">
                            Cancel
                        </vaadin-button>
                        <vaadin-button
                            id="ok-button"
                            theme="primary">
                            OK
                        </vaadin-button>
                    </div>
                </div>
            `, root);
            
            root.addEventListener('click', this._boundHandleClick);
            root.addEventListener('value-changed', this._boundHandleValueChanged, true);
            root.addEventListener('keydown', this._boundHandleKeyDown as EventListener, true);
            
            setTimeout(() => {
                const input = root.querySelector('#prompt-input') as HTMLElement & { 
                    inputElement?: HTMLInputElement;
                    focus: () => void;
                };
                const cancelButton = root.querySelector('#cancel-button');
                const okButton = root.querySelector('#ok-button');
                
                if (input) {
                    input.addEventListener('value-changed', ((e: CustomEvent) => {
                        this._tempInputValue = e.detail.value || '';
                    }) as EventListener);
                    
                    const inputEl = input.inputElement;
                    if (inputEl) {
                        inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                this._handleConfirm();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                this._handleCancel();
                            }
                        });
                    }
                    
                    input.focus();
                    if (inputEl) {
                        inputEl.select();
                    }
                }
                
                if (cancelButton) {
                    cancelButton.addEventListener('click', () => {
                        this._handleCancel();
                    });
                }
                
                if (okButton) {
                    okButton.addEventListener('click', () => {
                        this._handleConfirm();
                    });
                }
            }, 100);
        }
    };
    
    private _handleClick(e: Event): void {
        const target = (e.target as HTMLElement).closest('vaadin-button') as HTMLElement | null;
        if (!target) return;
        
        const id = target.id;
        if (id === 'ok-button') {
            this._handleConfirm();
        } else if (id === 'cancel-button') {
            this._handleCancel();
        }
    }
    
    private _handleValueChanged(e: Event): void {
        const target = e.target as HTMLElement;
        if (target && target.id === 'prompt-input') {
            this._tempInputValue = (e as CustomEvent).detail.value || '';
        }
    }
    
    private _handleKeyDown(e: KeyboardEvent): void {
        const target = e.target as HTMLElement;
        if (target && (target.id === 'prompt-input' || target.closest('#prompt-input'))) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this._handleConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this._handleCancel();
            }
        }
    }

    override render() {
        return html`
            <vaadin-dialog
                .opened="${this._open}"
                @opened-changed="${(e: CustomEvent) => {
                    if (!e.detail.value && this._resolve) {
                        this._handleCancel();
                    }
                }}"
                .noCloseOnOutsideClick="${true}"
                .noCloseOnEsc="${false}"
                .renderer="${this._dialogRenderer}">
            </vaadin-dialog>
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

