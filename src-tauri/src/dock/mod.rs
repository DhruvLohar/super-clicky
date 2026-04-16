use tauri::{App, Manager, PhysicalPosition};

const DOCK_WIDTH: i32 = 550;
const DOCK_HEIGHT: i32 = 120;
const MARGIN: i32 = 8;

pub fn setup(app: &App) {
    if let Some(dock) = app.get_webview_window("dock") {
        if let Ok(Some(monitor)) = dock.primary_monitor() {
            let size = monitor.size();
            let scale = monitor.scale_factor();
            let screen_w = (size.width as f64 / scale) as i32;
            let screen_h = (size.height as f64 / scale) as i32;
            let dock_x = screen_w - DOCK_WIDTH - MARGIN;
            let dock_y = (screen_h - DOCK_HEIGHT) / 2;
            let _ = dock.set_position(PhysicalPosition::new(
                (dock_x as f64 * scale) as i32,
                (dock_y as f64 * scale) as i32,
            ));
        }
    }
}
