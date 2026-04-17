import { GoogleGenAI } from "@google/genai";
import SYSTEM_PROMPT from "./prompt";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  httpOptions: { timeout: 120_000 },
});

export async function* explainWithScreenshot(
  audioTranscribed: string,
  screenshotBase64: string
): AsyncGenerator<string> {
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    config: {
      tools: [
        {
          googleSearch: {},
        },
      ],
      systemInstruction: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: screenshotBase64,
            },
          },
          {
            text: audioTranscribed,
          },
        ],
      },
    ],
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
