import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
});

export async function speechToText(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], "recording.wav", { type: "audio/wav" });

  const result = await elevenlabs.speechToText.convert({
    file,
    modelId: "scribe_v2",
    timestampsGranularity: "word",
  });

  return result.text;
}
