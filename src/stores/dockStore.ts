import { create } from "zustand";

export interface Message {
  query: string;
  response: string;
}

interface DockState {
  isHovered: boolean;
  setHovered: (h: boolean) => void;
  isOpen: boolean;
  isSpeaking: boolean;
  setSpeaking: (v: boolean) => void;
  messages: Message[];
  userQuery: string;
  streamedText: string;
  openPanel: () => void;
  setUserQuery: (q: string) => void;
  appendText: (chunk: string) => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export const useDockStore = create<DockState>((set) => ({
  isHovered: false,
  setHovered: (isHovered) => set({ isHovered }),
  isOpen: false,
  isSpeaking: false,
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  messages: [],
  userQuery: "",
  streamedText: "",
  openPanel: () => set({ isOpen: true }),
  setUserQuery: (userQuery) =>
    set((s) => ({
      userQuery,
      streamedText: "",
      messages: [...s.messages, { query: userQuery, response: "" }],
    })),
  appendText: (chunk) =>
    set((s) => {
      const messages = [...s.messages];
      if (messages.length > 0) {
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, response: last.response + chunk };
      }
      return { streamedText: s.streamedText + chunk, messages };
    }),
  closePanel: () => set({ isOpen: false, userQuery: "", streamedText: "", messages: [] }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
}));
