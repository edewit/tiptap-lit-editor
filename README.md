# TipTap Lit Editor

A TipTap-based rich text editor built with Lit components, featuring:

- **Gutter Menu** - Appears on hover with drag handle and add block button
- **Floating Menu** - Block insertion menu (headings, lists, code blocks)
- **Bubble Menu** - Text formatting menu (bold, italic, links, images)
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
- Syntax-highlighted code blocks
- Tables and rich content

## Usage

### Basic Usage with TipTapEditor

```javascript
import { TipTapEditor } from 'tiptap-lit-editor';

// The TipTapEditor component provides a complete editing experience
// with gutter menu, floating menu, and bubble menu built-in
```

```html
<tiptap-editor
  .content="${myContent}"
  .markdown="${true}"
  @content-changed="${handleContentChange}">
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

## License

Apache-2.0

