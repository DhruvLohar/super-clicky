use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Builder, Code, Modifiers, ShortcutState};

use crate::core::{self, ScreenshotSlot};

pub fn register(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let is_recording = Arc::new(AtomicBool::new(false));
    let stop_signal = Arc::new(AtomicBool::new(false));
    let ss_slot = Arc::new(ScreenshotSlot::new());

    let app_handle = app.clone();

    app.plugin(
        Builder::new()
            .with_shortcuts(["ctrl+alt+r", "ctrl+shift+q"])?
            .with_handler(move |_app, shortcut, event| {
                if event.state != ShortcutState::Pressed {
                    return;
                }

                if shortcut.matches(Modifiers::CONTROL | Modifiers::ALT, Code::KeyR) {
                    let was_recording = is_recording.load(Ordering::Relaxed);
                    core::handle_record_toggle(&is_recording, &stop_signal, &app_handle, &ss_slot);
                    let _ = _app.emit("recording-state", !was_recording);
                } else if shortcut.matches(Modifiers::CONTROL | Modifiers::SHIFT, Code::KeyQ) {
                    println!("[shortcuts] Ctrl+Shift+Q → exiting");
                    app_handle.exit(0);
                }
            })
            .build(),
    )?;

    Ok(())
}
