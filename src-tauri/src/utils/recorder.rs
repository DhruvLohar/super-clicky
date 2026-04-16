use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

pub fn record_audio_until_stopped(
    output_path: &str,
    stop_signal: Arc<AtomicBool>,
) -> Result<(), String> {
    let host = cpal::default_host();

    let device = host
        .default_input_device()
        .ok_or_else(|| "No input device available".to_string())?;

    let config = device
        .default_input_config()
        .map_err(|e| format!("Failed to get input config: {e}"))?;

    let sample_rate = config.sample_rate().0;
    let channels = config.channels();

    let spec = hound::WavSpec {
        channels,
        sample_rate,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    let writer = hound::WavWriter::create(output_path, spec)
        .map_err(|e| format!("Failed to create WAV file: {e}"))?;
    let writer = Arc::new(Mutex::new(Some(writer)));

    let writer_clone = Arc::clone(&writer);
    let err_flag: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let err_clone = Arc::clone(&err_flag);

    let stream = match config.sample_format() {
        cpal::SampleFormat::I16 => {
            device.build_input_stream(
                &config.into(),
                move |data: &[i16], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut guard) = writer_clone.lock() {
                        if let Some(ref mut w) = *guard {
                            for &sample in data {
                                if w.write_sample(sample).is_err() {
                                    break;
                                }
                            }
                        }
                    }
                },
                move |e| {
                    if let Ok(mut guard) = err_clone.lock() {
                        *guard = Some(format!("Stream error: {e}"));
                    }
                },
                None,
            )
        }
        cpal::SampleFormat::F32 => {
            device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut guard) = writer_clone.lock() {
                        if let Some(ref mut w) = *guard {
                            for &sample in data {
                                let clamped = sample.clamp(-1.0, 1.0);
                                let as_i16 = (clamped * i16::MAX as f32) as i16;
                                if w.write_sample(as_i16).is_err() {
                                    break;
                                }
                            }
                        }
                    }
                },
                move |e| {
                    if let Ok(mut guard) = err_clone.lock() {
                        *guard = Some(format!("Stream error: {e}"));
                    }
                },
                None,
            )
        }
        format => return Err(format!("Unsupported sample format: {format:?}")),
    }
    .map_err(|e| format!("Failed to build input stream: {e}"))?;

    stream
        .play()
        .map_err(|e| format!("Failed to start recording: {e}"))?;

    while !stop_signal.load(Ordering::Relaxed) {
        std::thread::sleep(Duration::from_millis(50));
    }

    drop(stream);

    let mut guard = writer
        .lock()
        .map_err(|e| format!("Failed to lock writer: {e}"))?;
    if let Some(w) = guard.take() {
        w.finalize()
            .map_err(|e| format!("Failed to finalize WAV: {e}"))?;
    }

    if let Ok(guard) = err_flag.lock() {
        if let Some(ref err) = *guard {
            return Err(err.clone());
        }
    }

    Ok(())
}
