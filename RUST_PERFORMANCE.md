# RUST_PERF.md

## Goal

Keep Rust **fast, stable, and non-blocking** for our Tauri app.

Rust handles:

* Cursor tracking
* Screen capture
* Window control
* Automation

---

## Core Rules

### 1. Don’t block main thread

```rust
std::thread::spawn(move || {
  loop {
    // background work
  }
});
```

---

### 2. Always throttle loops

```rust
loop {
  // work
  std::thread::sleep(std::time::Duration::from_millis(16));
}
```

---

### 3. Avoid `.unwrap()`

```rust
if let Some(win) = app.get_webview_window("cursor") {
  // safe
}
```

---

### 4. Clone AppHandle for threads

```rust
let app_handle = app.handle().clone();
```

---

### 5. Don’t allocate in loops

```rust
let mut data = Vec::new();
loop {
  data.clear();
}
```

---

### 6. Keep commands fast

```rust
#[tauri::command]
fn get_cursor() -> (i32, i32) { (x, y) }
```

---

### 7. Don’t spam frontend

* Throttle events
* Send only when needed

---

### 8. Safe window ops

```rust
let _ = window.set_position(...);
```

---

### 9. Log for debugging

```rust
println!("pos: {:?}", pos);
```

---

## Structure

```
src-tauri/
├── src/
│   ├── cursor/        # cursor tracking logic
│   ├── dock/          # dock window logic
│   ├── utils/         # shared helpers
│   │   ├── common.rs
│   │   ├── cursor.rs
│   │   └── dock.rs
│   ├── lib.rs         # main Tauri setup (windows, threads)
│   └── main.rs        # entry point
├── capabilities/      # window permissions
├── tauri.conf.json    # window config
```

### Notes

* `cursor/` → real-time mouse tracking
* `dock/` → UI positioning + control
* `utils/` → reusable logic
* `lib.rs` → core app wiring (threads, windows)

---

## Priority

**Must have**

* No blocking
* No crashes
* Low CPU

**Nice to have**

* fewer allocations
* cleaner structure

---

## Rule

> If Rust lags or crashes → whole app breaks

Keep it simple, safe, and fast.
