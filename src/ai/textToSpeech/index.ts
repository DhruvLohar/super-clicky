import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
});

export async function textToSpeechBuffer(
  text: string,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  // mCQMfsqGDT6IDkEKR20a - indian
  // JBFqnCBsd6RMkjVDRZzb - free
  const audio = await elevenlabs.textToSpeech.convert('mCQMfsqGDT6IDkEKR20a', {
    modelId: 'eleven_turbo_v2_5',
    text,
    outputFormat: 'mp3_44100_128',
    voiceSettings: {
      stability: 0.3,
      similarityBoost: 0.75,
      useSpeakerBoost: true,
    },
  });

  const reader = audio.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  for (;;) {
    if (signal?.aborted) {
      reader.cancel();
      throw new DOMException('Aborted', 'AbortError');
    }
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result.buffer;
}
