use device_query::{DeviceQuery, DeviceState};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, LogicalPosition, Manager};

pub fn start_tracking(app_handle: AppHandle) {
    thread::spawn(move || {
        let device_state = DeviceState::new();

        if let Some(cursor_win) = app_handle.get_webview_window("cursor_window") {
            let _ = cursor_win.hide();
            let _ = cursor_win.show();
            let _ = cursor_win.set_ignore_cursor_events(true);

            let mut tick: u8 = 0;
            loop {
                let mouse = device_state.get_mouse().coords;
                let _ = cursor_win.set_position(LogicalPosition::new(
                    mouse.0 as f64 + 10.0,
                    mouse.1 as f64 + 10.0,
                )); 
                // print!("x: {}, y: {}\n", mouse.0 as f64 + 10.0, mouse.1 as f64 + 10.0);

                tick = tick.wrapping_add(1);
                if tick % 60 == 0 {
                    let _ = cursor_win.set_always_on_top(true);
                }

                thread::sleep(Duration::from_millis(16));
            }
        }
    });
}
