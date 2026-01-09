/**
 * Slash command extension for TipTap editor
 * Shows a dropdown menu when typing "/" at the start of a line
 */

import { html, render } from 'lit';
import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import './slash-menu.js';
import type { SlashMenu } from './slash-menu.js';

export interface BlockTypeItem {
    label: string;
    icon: string;
    command: (params: { editor: Editor; range: Range }) => void;
}

interface SuggestionProps<T> {
    editor: Editor;
    range: Range;
    query: string;
    items: T[];
    command: (item: T) => void;
    clientRect: (() => DOMRect | null) | null;
}

interface SuggestionOptions<T> {
    char?: string;
    startOfLine?: boolean;
    command?: (params: { editor: Editor; range: Range; props: T }) => void;
    items?: (params: { query: string }) => T[];
    render?: () => {
        onStart?: (props: SuggestionProps<T>) => void;
        onUpdate?: (props: SuggestionProps<T>) => void;
        onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
        onExit?: () => void;
    };
}

// Define all available block types with their commands
const BLOCK_TYPES: BlockTypeItem[] = [
    {
        label: 'Text',
        icon: 'T',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setParagraph().run();
        }
    },
    {
        label: 'Heading 1',
        icon: 'H₁',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
        }
    },
    {
        label: 'Heading 2',
        icon: 'H₂',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
        }
    },
    {
        label: 'Heading 3',
        icon: 'H₃',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
        }
    },
    {
        label: 'Heading 4',
        icon: 'H₄',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run();
        }
    },
    {
        label: 'Heading 5',
        icon: 'H₅',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 5 }).run();
        }
    },
    {
        label: 'Heading 6',
        icon: 'H₆',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 6 }).run();
        }
    },
    {
        label: 'Bullet List',
        icon: '≡',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        }
    },
    {
        label: 'Numbered List',
        icon: '1≡',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        }
    },
    // {
    //   label: 'Table',
    //   icon: '⩩',
    //   command: ({ editor, range }) => {
    //     editor.chain().focus().deleteRange(range).insertTable().run();
    //   }
    // },
    {
        label: 'Code Block',
        icon: '</>',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        }
    }
];

export interface SlashCommandOptions {
    suggestion: Partial<SuggestionOptions<BlockTypeItem>>;
}

/**
 * Create the SlashCommand extension
 */
export const SlashCommand = Extension.create<SlashCommandOptions>({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: true,
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: BlockTypeItem }) => {
                    props.command({ editor, range });
                },
                decorationContent: 'Filter...',
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion<BlockTypeItem>({
                editor: this.editor,
                ...this.options.suggestion,
                items: ({ query }: { query: string }) => {
                    return BLOCK_TYPES.filter(item =>
                        item.label.toLowerCase().includes(query.toLowerCase())
                    );
                },
                render: () => {
                    let component: SlashMenu | null = null;
                    let popup: HTMLDivElement | null = null;

                    const updatePosition = (clientRect: (() => DOMRect | null) | null): void => {
                        if (popup && clientRect) {
                            const rect = clientRect();
                            if (rect) {
                                popup.style.left = `${rect.left}px`;
                                popup.style.top = `${rect.bottom + 4}px`;
                            }
                        }
                    };

                    const renderPopup = (props: SuggestionProps<BlockTypeItem>): void => {
                        if (!popup) return;
                        
                        const template = html`
                            <qwc-slash-menu
                                .items="${props.items}"
                                .query="${props.query}"
                                @item-selected="${(e: CustomEvent<{ item: BlockTypeItem }>) => {
                                    const item = e.detail.item;
                                    if (item) {
                                        props.command(item);
                                    }
                                }}"
                            ></qwc-slash-menu>
                        `;
                        render(template, popup);
                        component = popup.querySelector('qwc-slash-menu') as SlashMenu | null;
                    };

                    return {
                        onStart: (props: SuggestionProps<BlockTypeItem>) => {
                            // Create popup container
                            popup = document.createElement('div');
                            popup.style.position = 'absolute';
                            popup.style.zIndex = '1000';
                            document.body.appendChild(popup);

                            // Render the slash menu using Lit template
                            renderPopup(props);
                            updatePosition(props.clientRect);
                        },

                        onUpdate: (props: SuggestionProps<BlockTypeItem>) => {
                            renderPopup(props);
                            updatePosition(props.clientRect);
                        },

                        onKeyDown: (props: { event: KeyboardEvent }) => {
                            if (props.event.key === 'Escape') {
                                if (popup) {
                                    popup.remove();
                                    popup = null;
                                }
                                return true;
                            }

                            if (component) {
                                return component.onKeyDown(props.event);
                            }

                            return false;
                        },

                        onExit: () => {
                            if (popup) {
                                popup.remove();
                                popup = null;
                            }
                            component = null;
                        },
                    };
                },
            }),
        ];
    },
});
