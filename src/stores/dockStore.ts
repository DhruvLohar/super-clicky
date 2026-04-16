import { create } from "zustand";

interface DockState {
  isHovered: boolean;
  setHovered: (h: boolean) => void;
  isOpen: boolean;
  streamedText: string;
  openPanel: () => void;
  appendText: (chunk: string) => void;
  closePanel: () => void;
}

export const useDockStore = create<DockState>((set) => ({
  isHovered: false,
  setHovered: (isHovered) => set({ isHovered }),
  isOpen: false,
  streamedText: "",
  openPanel: () => set({ isOpen: true, streamedText: "" }),
  appendText: (chunk) => set((s) => ({ streamedText: s.streamedText + chunk })),
  closePanel: () => set({ isOpen: false, streamedText: "" }),
}));
