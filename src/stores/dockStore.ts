import { create } from "zustand";

interface DockState {
  isHovered: boolean;
  setHovered: (h: boolean) => void;
}

export const useDockStore = create<DockState>((set) => ({
  isHovered: false,
  setHovered: (isHovered) => set({ isHovered }),
}));
