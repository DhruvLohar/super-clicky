use std::fs;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::utils::recorder::record_audio_until_stopped;
use crate::utils::screenshot::take_screenshot;

pub fn handle_record_toggle(
    is_recording: &Arc<AtomicBool>,
    stop_signal: &Arc<AtomicBool>,
) {
    if is_recording.load(Ordering::Relaxed) {
        stop_recording(is_recording, stop_signal);
    } else {
        start_recording(is_recording, stop_signal);
    }
}

fn start_recording(is_recording: &Arc<AtomicBool>, stop_signal: &Arc<AtomicBool>) {
    stop_signal.store(false, Ordering::Relaxed);
    is_recording.store(true, Ordering::Relaxed);

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
        } else {
            println!("[core] Recording saved → {rec_path}");
        }

        is_rec.store(false, Ordering::Relaxed);
    });
}

fn stop_recording(is_recording: &Arc<AtomicBool>, stop_signal: &Arc<AtomicBool>) {
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
        Ok(_) => println!("[core] Screenshot saved → {ss_path}"),
        Err(e) => eprintln!("[core] Screenshot error: {e}"),
    }
}
