# StarUML Controller MCP Server — Sequence Diagram

An MCP (Model Context Protocol) server specialized for **Sequence Diagrams**. Enables AI assistants like Claude to programmatically create and manage sequence diagrams in [StarUML](https://staruml.io/) — interactions, lifelines, messages, combined fragments, operands, state invariants, and interaction uses.

<p align="center">
  <img src="images/demo-seq-creation.gif" alt="AI generating a Login Check sequence diagram from source code" width="800">
  <br>
  <em>AI analyzing source code and generating a sequence diagram through MCP tools</em>
</p>

## Architecture

<p align="center">
  <img src="images/architecture.svg" alt="Architecture: Claude ↔ MCP (stdio) ↔ staruml-controller-seq-mcp ↔ HTTP REST API ↔ StarUML" width="800">
</p>

## Prerequisites

- **Node.js 20+**
- **StarUML** with the [staruml-controller](https://github.com/pontasan/staruml-controller) extension 2.x installed and running

> **Upgrading from 1.x**: version 2 needs the [staruml-controller](https://github.com/pontasan/staruml-controller) extension 2.x, which requires a password. Update the extension, `staruml-controller-mcp-core` and this package together. Pull and rebuild `staruml-controller-mcp-core` first, then this package.

## Setup

### 1. Clone and build the core package

```bash
git clone https://github.com/pontasan/staruml-controller-mcp-core.git
cd staruml-controller-mcp-core
npm install && npm run build
cd ..
```

### 2. Clone and build this package

```bash
git clone https://github.com/pontasan/staruml-controller-seq-mcp.git
cd staruml-controller-seq-mcp
npm install && npm run build
```

### 3. Start the StarUML Controller Server

1. Launch **StarUML** and open a project (or create a new one)
2. From the menu bar, select **Tools > StarUML Controller > Start Server...**

<p align="center">
  <img src="images/start-server.jpg" alt="Tools menu showing StarUML Controller > Start Server" width="700">
</p>

3. A dialog asks for the port (default: `12345`) and the password. A random UUID is filled in as the password automatically; keep it, press **Regenerate** for a new one, or type your own. Click **Start Server**

<p align="center">
  <img src="images/port-dialog.jpg" alt="Start dialog with the port and the password" width="400">
</p>

4. The HTTP server starts and the password is copied to the clipboard, so you can paste it into the MCP server setting (`STARUML_PASSWORD`). The password is remembered for the next start. To copy it again or to change it, stop the server and open **Start Server...** again: the dialog shows the password with **Copy** and **Regenerate** buttons
5. All Sequence Diagram tools become available via MCP

### 4. Configure your AI assistant

**Claude Code** — add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "staruml-seq": {
      "command": "node",
      "args": ["/absolute/path/to/staruml-controller-seq-mcp/dist/index.js"],
      "env": { "STARUML_PASSWORD": "<password>" }
    }
  }
}
```

Or via CLI:

```bash
claude mcp add staruml-seq -e STARUML_PASSWORD=<password> -- node /absolute/path/to/staruml-controller-seq-mcp/dist/index.js
```

**Claude Desktop** — add to your config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "staruml-seq": {
      "command": "node",
      "args": ["/absolute/path/to/staruml-controller-seq-mcp/dist/index.js"],
      "env": { "STARUML_PASSWORD": "<password>" }
    }
  }
}
```

5. Restart your AI assistant.

## Available Tools

All tools accept optional `host` and `port` parameters. Their defaults come from environment variables of the MCP server:

| Variable | Required | Description |
|----------|----------|-------------|
| `STARUML_PASSWORD` | Yes | The password entered when the StarUML Controller server was started |
| `STARUML_HOST` | No | Host of the machine running StarUML (default: `localhost`) |
| `STARUML_PORT` | No | Port of the StarUML Controller server (default: `12345`) |

The password is never a tool parameter, so it does not pass through the AI conversation.

**File paths**: tools that write or read files (`diagram_export`, `project_export`, `project_export_all`, `project_export_doc`, `project_import`) use a `path` on the machine running this MCP server. `save_project` and `open_project` use a `path` on the machine running StarUML.

### Sequence Diagram Tools

The core of this server — full CRUD for every Sequence Diagram resource.

| Resource | Tools |
|---|---|
| **Interactions** | `seq_list_interactions`, `seq_create_interaction`, `seq_get_interaction`, `seq_update_interaction`, `seq_delete_interaction` |
| **Diagrams** | `seq_list_diagrams`, `seq_create_diagram`, `seq_get_diagram`, `seq_update_diagram`, `seq_delete_diagram` |
| **Lifelines** | `seq_list_lifelines`, `seq_create_lifeline`, `seq_get_lifeline`, `seq_update_lifeline`, `seq_delete_lifeline` |
| **Messages** | `seq_list_messages`, `seq_create_message`, `seq_get_message`, `seq_update_message`, `seq_delete_message` |
| **Combined Fragments** | `seq_list_combined_fragments`, `seq_create_combined_fragment`, `seq_get_combined_fragment`, `seq_update_combined_fragment`, `seq_delete_combined_fragment` |
| **Operands** | `seq_list_operands`, `seq_create_operand`, `seq_get_operand`, `seq_update_operand`, `seq_delete_operand` |
| **State Invariants** | `seq_list_state_invariants`, `seq_create_state_invariant`, `seq_get_state_invariant`, `seq_update_state_invariant`, `seq_delete_state_invariant` |
| **Interaction Uses** | `seq_list_interaction_uses`, `seq_create_interaction_use`, `seq_get_interaction_use`, `seq_update_interaction_use`, `seq_delete_interaction_use` |

### Common Tools

Shared infrastructure tools available across all StarUML Controller MCP servers.

<details>
<summary><strong>General</strong> — status, elements, tags, project I/O</summary>

| Tool | Description |
|---|---|
| `get_status` | Get server status, version, and endpoint list |
| `get_element` | Get any element by ID |
| `list_element_tags` | List tags on an element |
| `create_element_tag` | Create a tag on an element |
| `get_tag` | Get tag details |
| `update_tag` | Update a tag |
| `delete_tag` | Delete a tag |
| `save_project` | Save project to a .mdj file |
| `open_project` | Open a .mdj project file |

</details>

<details>
<summary><strong>Project</strong> — new, close, import, export</summary>

| Tool | Description |
|---|---|
| `project_new` | Create a new empty project |
| `project_close` | Close the current project |
| `project_import` | Import a .mdj fragment into the project |
| `project_export` | Export a model fragment to a .mdj file |
| `project_export_all` | Export all diagrams as images (PNG/SVG/JPEG/PDF) |
| `project_export_doc` | Export project documentation (HTML/Markdown) |

</details>

<details>
<summary><strong>Utility</strong> — undo, redo, search, validate, mermaid, generate</summary>

| Tool | Description |
|---|---|
| `undo` | Undo the last action |
| `redo` | Redo the last undone action |
| `search` | Search elements by keyword with optional type filter |
| `validate` | Run model validation |
| `mermaid_import` | Import a Mermaid diagram definition |
| `generate_diagram` | Generate a diagram from natural language (requires AI extension) |

</details>

<details>
<summary><strong>Diagrams</strong> — CRUD, export, layout, zoom</summary>

| Tool | Description |
|---|---|
| `diagram_list` | List all diagrams (optionally filter by type) |
| `diagram_create` | Create a new diagram of any type |
| `diagram_get` | Get diagram details by ID |
| `diagram_update` | Update diagram name |
| `diagram_delete` | Delete a diagram |
| `diagram_list_elements` | List all elements on a diagram |
| `diagram_list_views` | List all views on a diagram |
| `diagram_create_element` | Create a node element on a diagram |
| `diagram_create_relation` | Create a relation between elements |
| `diagram_export` | Export diagram as image (PNG/SVG/JPEG/PDF) |
| `diagram_layout` | Auto-layout diagram with configurable direction |
| `diagram_open` | Open/activate a diagram in the editor |
| `diagram_zoom` | Set diagram zoom level |
| `diagram_create_view_of` | Create a view of an existing model on a diagram |
| `diagram_link_object` | Create a UMLLinkObject on an object diagram |

</details>

<details>
<summary><strong>Notes & Shapes</strong> — notes, note links, free lines, shapes</summary>

| Tool | Description |
|---|---|
| `note_list` | List all notes on a diagram |
| `note_create` | Create a note with text and position |
| `note_get` | Get note details |
| `note_update` | Update note text |
| `note_delete` | Delete a note |
| `note_link_list` | List all note links on a diagram |
| `note_link_create` | Create a link between a note and an element |
| `note_link_delete` | Delete a note link |
| `free_line_list` | List all free lines on a diagram |
| `free_line_create` | Create a free line on a diagram |
| `free_line_delete` | Delete a free line |
| `shape_list` | List all shapes on a diagram |
| `shape_create` | Create a shape (Text, TextBox, Rect, RoundRect, Ellipse, Hyperlink, Image) |
| `shape_get` | Get shape details |
| `shape_update` | Update shape text |
| `shape_delete` | Delete a shape |

</details>

<details>
<summary><strong>Views & Elements</strong> — positioning, styling, element management</summary>

| Tool | Description |
|---|---|
| `view_update` | Move/resize a view (left, top, width, height) |
| `view_update_style` | Update visual style (fillColor, lineColor, fontColor, fontSize, etc.) |
| `view_reconnect` | Reconnect an edge to different source/target |
| `view_align` | Align/distribute multiple views |
| `element_update` | Update any element's name and documentation |
| `element_delete` | Delete any element by ID |
| `element_list_relationships` | List all relationships of an element |
| `element_list_views` | List all views of an element across diagrams |
| `element_relocate` | Move element to a different parent |
| `element_create_child` | Create a child element (attribute, operation, etc.) |
| `element_reorder` | Reorder element within parent (up/down) |

</details>

## Typical Workflow

```
1. seq_create_interaction          → Create an interaction container
2. seq_create_diagram              → Create a sequence diagram
3. seq_create_lifeline (x N)       → Add participants (lifelines)
4. seq_create_message (x N)        → Draw messages between lifelines
5. seq_create_combined_fragment    → Add alt/loop/opt fragments
6. seq_create_operand              → Add condition branches
7. diagram_export                  → Export as PNG/SVG
```

## Message Types

The `seq_create_message` tool supports multiple message sorts:

| messageSort | Arrow Style | Use Case |
|---|---|---|
| `synchCall` | Solid filled arrow | Synchronous method call (default) |
| `reply` | Dashed arrow | Return value |
| `asynchCall` | Open arrow | Asynchronous call |
| `asynchSignal` | Open arrow | Asynchronous signal |
| `createMessage` | Dashed with open arrow | Object creation |
| `deleteMessage` | Solid with X | Object destruction |

## Combined Fragment Types

The `seq_create_combined_fragment` tool supports:

| interactionOperator | Description |
|---|---|
| `alt` | If/else branching |
| `opt` | Optional execution |
| `loop` | Repeated execution |
| `par` | Parallel execution |
| `break` | Break out of enclosing interaction |
| `critical` | Critical region |
| `neg` | Invalid trace |
| `assert` | Assertion |
| `strict` | Strict ordering |
| `seq` | Weak ordering |
| `ignore` | Ignore messages |
| `consider` | Consider messages |

## Related Projects

This server is part of the **StarUML Controller MCP** family:

| Server | Diagram Type |
|---|---|
| staruml-controller-erd-mcp | Entity-Relationship Diagram |
| **staruml-controller-seq-mcp** | Sequence Diagram |
| staruml-controller-class-mcp | Class / Package Diagram |
| staruml-controller-usecase-mcp | Use Case Diagram |
| staruml-controller-activity-mcp | Activity Diagram |
| staruml-controller-bpmn-mcp | BPMN Diagram |
| staruml-controller-sysml-mcp | SysML Diagram |
| [and 18 more...](https://github.com/pontasan/staruml-controller-mcp) | |

All servers share common tools and add diagram-specific tools on top. Install only what you need.

## License

MIT
