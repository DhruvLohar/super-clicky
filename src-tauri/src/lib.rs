use tauri::{Manager, PhysicalPosition};
use device_query::{DeviceQuery, DeviceState};
use std::thread;
use std::time::Duration;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // Position the dock at the bottom center of the primary monitor
            if let Some(dock) = app.get_webview_window("dock") {
                if let Some(monitor) = dock.primary_monitor()? {
                    let size = monitor.size();
                    let dock_x = (size.width / 2) - 300;
                    let dock_y = size.height - 100;
                    dock.set_position(PhysicalPosition::new(dock_x as i32, dock_y as i32))?;
                }
            }

            // Spawn mouse-tracking thread for cursor_window
            let app_handle = app.handle().clone();
            thread::spawn(move || {
                let device_state = DeviceState::new();

                if let Some(cursor_win) = app_handle.get_webview_window("cursor_window") {
                    // Force proper initialization: hide then show
                    let _ = cursor_win.hide();
                    let _ = cursor_win.show();
                    let _ = cursor_win.set_ignore_cursor_events(true);

                    let mut tick: u8 = 0;
                    loop {
                        let mouse = device_state.get_mouse().coords;
                        let _ = cursor_win.set_position(PhysicalPosition::new(
                            mouse.0 as i32 + 15,
                            mouse.1 as i32 + 15,
                        ));

                        // Re-assert always-on-top every ~1s (every 60 ticks)
                        // to prevent the WM from burying click-through windows
                        tick = tick.wrapping_add(1);
                        if tick % 60 == 0 {
                            let _ = cursor_win.set_always_on_top(true);
                        }

                        thread::sleep(Duration::from_millis(16));
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
