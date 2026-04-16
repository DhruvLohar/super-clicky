mod core;
mod cursor;
mod dock;
mod shortcuts;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            dock::setup(app);
            cursor::start_tracking(app.handle().clone());
            if let Err(e) = shortcuts::register(app.handle()) {
                eprintln!("[shortcuts] Failed to register shortcuts: {e}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
