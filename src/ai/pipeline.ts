import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useDockStore } from "../stores/dockStore";
import { textToSpeechBuffer } from "./textToSpeech";

interface ProcessQueryPayload {
  audioPath: string;
  screenshotPath: string;
}

let listenerActive = false;

let activeAudioSource: AudioBufferSourceNode | null = null;
let activeAudioContext: AudioContext | null = null;

export function stopAudio(): void {
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
      activeAudioSource.disconnect();
    } catch {}
    activeAudioSource = null;
    console.log("[audio] Playback stopped");
  }
  if (activeAudioContext) {
    activeAudioContext.close().catch(() => {});
    activeAudioContext = null;
  }
  useDockStore.getState().setSpeaking(false);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let unlistenPromise: Promise<() => void> | null = null;
let unsubStore: (() => void) | null = null;

export function startPipelineListener(): () => void {
  if (listenerActive) {
    console.log("[pipeline] Listener already active, skipping duplicate registration");
    return () => {};
  }
  listenerActive = true;
  console.log("[pipeline] Registering listener");

  unsubStore = useDockStore.subscribe((state, prev) => {
    if (prev.isOpen && !state.isOpen) {
      console.log("[audio] Panel closed → stopping audio");
      stopAudio();
    }
  });

  let queryGeneration = 0;

  unlistenPromise = listen<ProcessQueryPayload>("process-query", async (event) => {
    const { audioPath, screenshotPath } = event.payload;
    const { openPanel, appendText, setUserQuery } = useDockStore.getState();

    stopAudio();
    const thisGeneration = ++queryGeneration;

    try {
      openPanel();

      console.log("[pipeline] Received process-query (gen:", thisGeneration, ") → audio:", audioPath, "screenshot:", screenshotPath);

      const [audioBase64, screenshotBase64] = await Promise.all([
        invoke<string>("read_file_base64", { path: audioPath }),
        invoke<string>("read_file_base64", { path: screenshotPath }),
      ]);

      if (thisGeneration !== queryGeneration) { console.log("[pipeline] Stale gen, aborting"); return; }

      console.log("[pipeline] Files read → audio:", audioBase64.length, "chars, screenshot:", screenshotBase64.length, "chars");

      const audioBytes = base64ToUint8Array(audioBase64);
      const audioBlob = new Blob([audioBytes], { type: "audio/wav" });

      const { speechToText } = await import("./speechToText");
      const transcription = await speechToText(audioBlob);

      if (thisGeneration !== queryGeneration) { console.log("[pipeline] Stale gen, aborting"); return; }

      console.log("[pipeline] Transcription:", transcription.slice(0, 100));
      setUserQuery(transcription);

      const { explainWithScreenshot } = await import("./geminiLLM");
      let chunkCount = 0;
      let fullText = "";

      for await (const chunk of explainWithScreenshot(transcription, screenshotBase64)) {
        if (thisGeneration !== queryGeneration) { console.log("[pipeline] Stale gen mid-stream, aborting"); return; }
        if (chunkCount === 0) {
          console.log("[pipeline] Got first LLM chunk:", chunk.slice(0, 80));
        }
        chunkCount++;
        appendText(chunk);
        fullText += chunk;
      }

      if (thisGeneration !== queryGeneration) { console.log("[pipeline] Stale gen after stream, aborting"); return; }

      console.log("[pipeline] LLM stream complete →", chunkCount, "chunks,", fullText.length, "chars total");

      console.log("[audio] Starting TTS for full response...");
      const ttsStart = performance.now();
      const audioBuffer = await textToSpeechBuffer(fullText);
      const ttsEnd = performance.now();

      if (thisGeneration !== queryGeneration) { console.log("[audio] Stale gen after TTS, aborting"); return; }

      console.log("[audio] TTS buffer received →", audioBuffer.byteLength, "bytes in", Math.round(ttsEnd - ttsStart), "ms");

      const ctx = new AudioContext();
      activeAudioContext = ctx;

      if (ctx.state === "suspended") {
        await ctx.resume();
        console.log("[audio] AudioContext resumed from suspended state");
      }

      console.log("[audio] Decoding audio data...");
      const decoded = await ctx.decodeAudioData(audioBuffer);
      console.log("[audio] Decoded → duration:", decoded.duration.toFixed(2), "s, sampleRate:", decoded.sampleRate);

      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.connect(ctx.destination);
      activeAudioSource = source;

      source.onended = () => {
        console.log("[audio] Playback ended naturally");
        activeAudioSource = null;
        activeAudioContext?.close().catch(() => {});
        activeAudioContext = null;
        useDockStore.getState().setSpeaking(false);
      };

      source.start(0);
      useDockStore.getState().setSpeaking(true);
      console.log("[audio] Playback started");

    } catch (err) {
      if (thisGeneration === queryGeneration) {
        appendText(`\nError: ${err}`);
      }
      console.error("[pipeline] Error:", err);
    }
  });

  return () => {
    console.log("[pipeline] Cleanup called");
    listenerActive = false;
    if (unlistenPromise) {
      unlistenPromise.then((fn) => fn());
      unlistenPromise = null;
    }
    if (unsubStore) {
      unsubStore();
      unsubStore = null;
    }
    stopAudio();
  };
}
