import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useDockStore } from "../stores/dockStore";

interface ProcessQueryPayload {
  audioPath: string;
  screenshotPath: string;
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

export function startPipelineListener(): () => void {
  let unlisten: (() => void) | null = null;

  listen<ProcessQueryPayload>("process-query", async (event) => {
    const { audioPath, screenshotPath } = event.payload;
    const { openPanel, appendText, setUserQuery } = useDockStore.getState();

    try {
      openPanel();

      console.log("[pipeline] Received process-query → audio:", audioPath, "screenshot:", screenshotPath);
      console.log("[pipeline] Reading files via Tauri...");

      const [audioBase64, screenshotBase64] = await Promise.all([
        invoke<string>("read_file_base64", { path: audioPath }),
        invoke<string>("read_file_base64", { path: screenshotPath }),
      ]);

      console.log("[pipeline] Files read → audio:", audioBase64.length, "chars, screenshot:", screenshotBase64.length, "chars");

      const audioBytes = base64ToUint8Array(audioBase64);
      const audioBlob = new Blob([audioBytes], { type: "audio/wav" });

      console.log("[pipeline] Calling speechToText...");

      const { speechToText } = await import("./speechToText");
      const transcription = await speechToText(audioBlob);

      console.log("[pipeline] Transcription result:", transcription.slice(0, 100), transcription.length > 100 ? "..." : "");
      setUserQuery(transcription);

      console.log("[pipeline] Calling Gemini LLM...");
      const { explainWithScreenshot } = await import("./geminiLLM");
      let chunkCount = 0;

      for await (const chunk of explainWithScreenshot(transcription, screenshotBase64)) {
        if (chunkCount === 0) {
          console.log("[pipeline] Got first LLM chunk:", chunk.slice(0, 80));
        }
        chunkCount++;
        appendText(chunk);
      }

      console.log("[pipeline] LLM stream complete →", chunkCount, "chunks");
    } catch (err) {
      appendText(`\nError: ${err}`);
      console.error("[pipeline] Error:", err);
    }
  }).then((fn) => {
    unlisten = fn;
  });

  return () => {
    if (unlisten) unlisten();
  };
}
