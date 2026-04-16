use screenshots::Screen;
use std::fs;
use std::path::Path;

/// Capture the primary screen and save as PNG to `save_path`.
pub fn take_screenshot(save_path: &str) -> Result<(), String> {
    let screens = Screen::all().map_err(|e| format!("Failed to enumerate screens: {e}"))?;

    let primary = screens
        .into_iter()
        .find(|s| s.display_info.is_primary)
        .ok_or_else(|| "No primary screen found".to_string())?;

    let image = primary
        .capture()
        .map_err(|e| format!("Failed to capture screen: {e}"))?;

    // Ensure parent directory exists
    if let Some(parent) = Path::new(save_path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {e}"))?;
    }

    image
        .save(save_path)
        .map_err(|e| format!("Failed to save screenshot: {e}"))?;

    Ok(())
}
