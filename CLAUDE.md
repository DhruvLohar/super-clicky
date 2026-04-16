# CLAUDE.md

## Project Overview

We are building a **cross-platform desktop AI assistant** using:

* Tauri (Rust backend for native OS access)
* Refer : @RUST_PERFORMANCE.md for rust code
* React (frontend overlay UI)

This is a **hackathon-focused MVP**, so prioritize:

* Speed of development
* Working demo over perfection
* Smooth, responsive user experience

---

## Core Architecture

* **Frontend (React)**
  Handles UI rendering (overlay, highlights, debug panels)

* **Backend (Rust via Tauri)**
  Handles:

  * Screen capture
  * Cursor tracking
  * Mouse/keyboard automation
  * OS-level integrations

---

## Key Features (MVP Scope)

1. Capture screen on trigger (hotkey or interval)
2. Get cursor position (x, y)
3. Send screenshot + cursor context to AI
4. Receive bounding box of relevant UI element
5. Render highlight overlay on screen
6. Execute actions (e.g., move mouse and click)
7. (Optional) Voice command support

---

## Development Guidelines

* Keep things **simple and working**
* Avoid over-engineering
* Prefer API-based AI over local models
* Optimize for **low latency and responsiveness**
* Avoid heavy dependencies unless necessary

---

## Important Notes

* Native OS interactions must be handled in Rust
* Be mindful of OS permissions (especially macOS screen recording & accessibility)

---

## Code Quality & Tooling

* Create proper components for each of the logics and maintain readability of code
* Make use of useCallback / useMemo and Export all the components that you use as memo to reduce re-renders
* Use the **ctx7 plugin** to:
  * Cross-check code syntax
  * Validate API usage
  * Ensure correctness across languages (Rust, TypeScript, etc.)

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
