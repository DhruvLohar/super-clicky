use rodio::{Decoder, OutputStream, Sink};
use std::fs::File;
use std::io::BufReader;
use std::thread;

/// Play an audio file (mp3/wav) from disk in a background thread.
/// Returns immediately — playback happens asynchronously.
pub fn play_audio(file_path: &str) -> Result<(), String> {
    let path = file_path.to_string();

    // Validate the file exists before spawning the thread
    if !std::path::Path::new(&path).exists() {
        return Err(format!("Audio file not found: {path}"));
    }

    thread::spawn(move || {
        let _result: Result<(), String> = (|| {
            let (_stream, stream_handle) = OutputStream::try_default()
                .map_err(|e| format!("Failed to open audio output: {e}"))?;

            let file =
                File::open(&path).map_err(|e| format!("Failed to open file: {e}"))?;

            let source = Decoder::new(BufReader::new(file))
                .map_err(|e| format!("Failed to decode audio: {e}"))?;

            let sink = Sink::try_new(&stream_handle)
                .map_err(|e| format!("Failed to create audio sink: {e}"))?;

            sink.append(source);
            sink.sleep_until_end();

            Ok(())
        })();
    });

    Ok(())
}
