use std::fs;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Emitter};

use crate::utils::recorder::record_audio_until_stopped;
use crate::utils::screenshot::take_screenshot;

pub struct ScreenshotSlot {
    path: Mutex<Option<String>>,
    ready: Condvar,
}

impl ScreenshotSlot {
    pub fn new() -> Self {
        Self {
            path: Mutex::new(None),
            ready: Condvar::new(),
        }
    }

    fn set(&self, p: String) {
        if let Ok(mut guard) = self.path.lock() {
            *guard = Some(p);
            self.ready.notify_one();
        }
    }

    fn wait_and_take(&self, timeout: Duration) -> Option<String> {
        if let Ok(guard) = self.path.lock() {
            let result = self
                .ready
                .wait_timeout_while(guard, timeout, |p| p.is_none());
            if let Ok((mut guard, _)) = result {
                return guard.take();
            }
        }
        None
    }

    fn clear(&self) {
        if let Ok(mut guard) = self.path.lock() {
            *guard = None;
        }
    }
}

pub fn handle_record_toggle(
    is_recording: &Arc<AtomicBool>,
    stop_signal: &Arc<AtomicBool>,
    app: &AppHandle,
    ss_slot: &Arc<ScreenshotSlot>,
) {
    if is_recording.load(Ordering::Relaxed) {
        stop_recording(is_recording, stop_signal, ss_slot);
    } else {
        start_recording(is_recording, stop_signal, app.clone(), Arc::clone(ss_slot));
    }
}

fn start_recording(
    is_recording: &Arc<AtomicBool>,
    stop_signal: &Arc<AtomicBool>,
    app: AppHandle,
    ss_slot: Arc<ScreenshotSlot>,
) {
    stop_signal.store(false, Ordering::Relaxed);
    is_recording.store(true, Ordering::Relaxed);
    ss_slot.clear();

    let stop = Arc::clone(stop_signal);
    let is_rec = Arc::clone(is_recording);

    std::thread::spawn(move || {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let rec_dir = "../media/recordings";
        if let Err(e) = fs::create_dir_all(rec_dir) {
            eprintln!("[core] Failed to create recordings dir: {e}");
            is_rec.store(false, Ordering::Relaxed);
            return;
        }

        let rec_path = format!("{rec_dir}/rec_{ts}.wav");
        println!("[core] Recording started → {rec_path}");

        if let Err(e) = record_audio_until_stopped(&rec_path, stop) {
            eprintln!("[core] Recording error: {e}");
            is_rec.store(false, Ordering::Relaxed);
            return;
        }

        println!("[core] Recording saved → {rec_path}");
        is_rec.store(false, Ordering::Relaxed);

        println!("[core] Waiting for screenshot...");
        match ss_slot.wait_and_take(Duration::from_secs(10)) {
            Some(ss_path) => {
                let _ = app.emit("process-query", serde_json::json!({
                    "audioPath": rec_path,
                    "screenshotPath": ss_path,
                }));
                println!("[core] Emitted process-query → audio: {rec_path}, screenshot: {ss_path}");
            }
            None => {
                eprintln!("[core] Screenshot timed out after 10s, skipping pipeline");
            }
        }
    });
}

fn stop_recording(
    is_recording: &Arc<AtomicBool>,
    stop_signal: &Arc<AtomicBool>,
    ss_slot: &Arc<ScreenshotSlot>,
) {
    stop_signal.store(true, Ordering::Relaxed);
    is_recording.store(false, Ordering::Relaxed);
    println!("[core] Recording stopped");

    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let ss_dir = "../media/screenshots";
    if let Err(e) = fs::create_dir_all(ss_dir) {
        eprintln!("[core] Failed to create screenshots dir: {e}");
        return;
    }

    let ss_path = format!("{ss_dir}/ss_{ts}.png");
    match take_screenshot(&ss_path) {
        Ok(_) => {
            println!("[core] Screenshot saved → {ss_path}");
            ss_slot.set(ss_path);
        }
        Err(e) => eprintln!("[core] Screenshot error: {e}"),
    }
}
