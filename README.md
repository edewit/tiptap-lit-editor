# TipTap Lit Editor

A TipTap-based rich text editor built with Lit components, featuring:

- **Gutter Menu** - Appears on hover with drag handle and add block button
- **Floating Menu** - Block insertion menu (headings, lists, code blocks)
- **Bubble Menu** - Text formatting menu (bold, italic, links, images)
- **Slash Command** - Type "/" at line start to insert blocks with typeahead
- **Prompt Dialog** - Reusable dialog for URL inputs

## Demo

🚀 **[Live Demo](https://edewit.github.io/tiptap-lit-editor/)**

## Installation

```bash
npm install tiptap-lit-editor
```

## Local Development

Run the demo locally:

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. The demo showcases:
- Markdown editing with live preview
- Gutter menu for drag-and-drop and block insertion
- Bubble menu for text formatting
- Slash command for quickly inserting blocks
- Syntax-highlighted code blocks
- Tables and rich content

## Usage

### Basic Usage with TipTapEditor

```javascript
import { TipTapEditor } from 'tiptap-lit-editor';

// The TipTapEditor component provides a complete editing experience
// with gutter menu, floating menu, and bubble menu built-in
```

When you use lit you can use it like this:

```html
<tiptap-editor
  .content="${myContent}"
  .markdown="${true}"
  @content-changed="${handleContentChange}">
</tiptap-editor>
```

When using html or another framework, you can render same way as a textarea:

```html
<tiptap-editor>
  <h1>Hello World</h1>
  <p>This is <strong>bold</strong> text.</p>
</tiptap-editor>
```
or with markdown:

```html
<tiptap-editor>
# Hello world

This is **bold** text.
</tiptap-editor>
```

### Using Individual Components

You can also use individual menu components with your own TipTap editor setup:

```javascript
import { 
  editorContext,
  BubbleMenu,
  FloatingMenu,
  GutterMenu,
  showPrompt
} from 'tiptap-lit-editor';
```

### TipTap Re-exports

The package re-exports commonly used TipTap modules:

```javascript
import {
  Editor,
  StarterKit,
  Markdown,
  Image,
  Link,
  BubbleMenuExtension,
  DragHandle,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  CodeBlockLowlight
} from 'tiptap-lit-editor';
```

## Components

### `<tiptap-editor>`

The main editor component with all menus integrated.

**Properties:**
- `content` (String) - Initial content (HTML or Markdown)
- `markdown` (Boolean) - Whether to use Markdown mode
- `editable` (Boolean) - Whether the editor is editable
- `extensions` (Array) - Additional TipTap extensions

**Events:**
- `content-changed` - Fired when content changes, with `detail.content`
- `selection-changed` - Fired when selection changes

### `<bubble-menu>`

Text selection menu for formatting.

### `<floating-menu>`

Block insertion menu accessible from the gutter.

### `<gutter-menu>`

Drag handle and add button that appears in the left gutter.

### `showPrompt(message, defaultValue)`

Helper function to show a prompt dialog. Returns a Promise.

```javascript
const url = await showPrompt('Enter URL:', 'https://');
if (url) {
  // User confirmed
}
```

## Editor Context

Components communicate via Lit Context. If building a custom editor:

```javascript
import { editorContext, ContextProvider } from 'tiptap-lit-editor';
import { ContextProvider } from '@lit/context';

// In your component:
this._provider = new ContextProvider(this, {
  context: editorContext,
  initialValue: { editor: null, editorElement: null }
});

// After editor creation:
this._provider.setValue({ editor: myEditor, editorElement: myElement });
```

## Styling

The editor uses CSS custom properties (CSS variables) for theming, making it easy to customize the appearance to match your application's design system.

### Basic Theming

Set CSS variables on the `<tiptap-editor>` element or any parent element:

```css
tiptap-editor {
  --tiptap-primary-color: #6366f1;
  --tiptap-primary-color-light: rgba(99, 102, 241, 0.1);
  --tiptap-border-radius-m: 12px;
}
```

Or apply a theme globally:

```css
:root {
  --tiptap-primary-color: #10b981;
  --tiptap-surface-color: #1f2937;
  --tiptap-text-color: #f9fafb;
  --tiptap-border-color: #374151;
}
```

### Available CSS Custom Properties

#### Colors

| Property | Default | Description |
|----------|---------|-------------|
| `--tiptap-primary-color` | `#1976d2` | Primary accent color (buttons, links, active states) |
| `--tiptap-primary-color-light` | `rgba(25, 118, 210, 0.1)` | Light primary for hover/active backgrounds |
| `--tiptap-primary-color-dark` | `#1565c0` | Darker primary for hover states on filled buttons |
| `--tiptap-primary-color-50` | `rgba(25, 118, 210, 0.5)` | 50% opacity primary (link underlines) |
| `--tiptap-surface-color` | `#fff` | Background color for menus and dialogs |
| `--tiptap-surface-color-alt` | `#fafafa` | Alternative surface (table rows, scrollbars) |
| `--tiptap-text-color` | `#1a1a1a` | Primary text color |
| `--tiptap-text-color-secondary` | `#666` | Secondary/muted text color |
| `--tiptap-border-color` | `#e0e0e0` | Border color for menus, inputs, tables |
| `--tiptap-hover-color` | `rgba(0, 0, 0, 0.05)` | Hover background for buttons |

#### Spacing

| Property | Default | Description |
|----------|---------|-------------|
| `--tiptap-space-xs` | `4px` | Extra small spacing (menu gaps, small padding) |
| `--tiptap-space-s` | `8px` | Small spacing (button padding, table cells) |
| `--tiptap-space-m` | `16px` | Medium spacing (dialog padding) |

#### Border Radius

| Property | Default | Description |
|----------|---------|-------------|
| `--tiptap-border-radius-s` | `4px` | Small radius (buttons, inputs) |
| `--tiptap-border-radius-m` | `8px` | Medium radius (menus, dialogs, code blocks) |

#### Typography

| Property | Default | Description |
|----------|---------|-------------|
| `--tiptap-font-family-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | Monospace font for code blocks |
| `--tiptap-font-size-xxs` | `11px` | Extra extra small (labels) |
| `--tiptap-font-size-xs` | `12px` | Extra small (drag handle) |
| `--tiptap-font-size-s` | `14px` | Small (menu buttons, inputs) |
| `--tiptap-font-size-l` | `18px` | Large (add button) |

### Light and Dark Mode

The editor defaults to a light theme. You can support dark mode using the `prefers-color-scheme` media query to automatically switch based on the user's system preference:

```css
/* Light mode (default) - no changes needed */

/* Dark mode - automatically applied when system prefers dark */
@media (prefers-color-scheme: dark) {
  tiptap-editor {
    --tiptap-primary-color: #60a5fa;
    --tiptap-primary-color-light: rgba(96, 165, 250, 0.15);
    --tiptap-primary-color-dark: #3b82f6;
    --tiptap-primary-color-50: rgba(96, 165, 250, 0.5);
    --tiptap-surface-color: #1e293b;
    --tiptap-surface-color-alt: #0f172a;
    --tiptap-text-color: #f1f5f9;
    --tiptap-text-color-secondary: #94a3b8;
    --tiptap-border-color: #334155;
    --tiptap-hover-color: rgba(255, 255, 255, 0.05);
  }
}
```

#### Manual Theme Control

If your application has its own theme toggle (not relying on system preference), use a class or attribute on a parent element:

```css
/* Light theme (default) */
tiptap-editor {
  --tiptap-surface-color: #fff;
  --tiptap-text-color: #1a1a1a;
  --tiptap-border-color: #e0e0e0;
  --tiptap-hover-color: rgba(0, 0, 0, 0.05);
}

/* Dark theme - applied via class on body or container */
.dark tiptap-editor,
[data-theme="dark"] tiptap-editor {
  --tiptap-primary-color: #60a5fa;
  --tiptap-primary-color-light: rgba(96, 165, 250, 0.15);
  --tiptap-primary-color-dark: #3b82f6;
  --tiptap-primary-color-50: rgba(96, 165, 250, 0.5);
  --tiptap-surface-color: #1e293b;
  --tiptap-surface-color-alt: #0f172a;
  --tiptap-text-color: #f1f5f9;
  --tiptap-text-color-secondary: #94a3b8;
  --tiptap-border-color: #334155;
  --tiptap-hover-color: rgba(255, 255, 255, 0.05);
}
```

Then toggle the theme in your application:

```javascript
// Toggle dark mode
document.body.classList.toggle('dark');

// Or using data attribute
document.documentElement.dataset.theme = 'dark';
```

### Example: Custom Brand Colors

```css
tiptap-editor {
  --tiptap-primary-color: #8b5cf6;
  --tiptap-primary-color-light: rgba(139, 92, 246, 0.1);
  --tiptap-primary-color-dark: #7c3aed;
  --tiptap-border-radius-s: 6px;
  --tiptap-border-radius-m: 12px;
}
```

### Styling with CSS Parts (Advanced)

For more fine-grained control, you can use the `::part()` selector if the component exposes CSS parts, or target the component's shadow DOM via CSS custom properties as shown above.

Since the editor uses Lit's Shadow DOM, the CSS custom properties approach is the recommended way to style the component while maintaining encapsulation.

## License

Apache-2.0

