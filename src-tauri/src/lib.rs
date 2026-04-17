mod core;
mod cursor;
mod dock;
mod shortcuts;
mod utils;

#[tauri::command]
fn read_file_base64(path: String) -> Result<String, String> {
    use base64::Engine;
    let bytes = std::fs::read(&path).map_err(|e| format!("Failed to read {path}: {e}"))?;
    Ok(base64::engine::general_purpose::STANDARD.encode(&bytes))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_file_base64])
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
