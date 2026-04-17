import { create } from "zustand";

interface DockState {
  isHovered: boolean;
  setHovered: (h: boolean) => void;
  isOpen: boolean;
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
  userQuery: "",
  streamedText: "",
  openPanel: () => set({ isOpen: true, userQuery: "", streamedText: "" }),
  setUserQuery: (userQuery) => set({ userQuery }),
  appendText: (chunk) => set((s) => ({ streamedText: s.streamedText + chunk })),
  closePanel: () => set({ isOpen: false, userQuery: "", streamedText: "" }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
}));
