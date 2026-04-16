import { useDockStore } from "../stores/dockStore";

export function useDock() {
  const streamTextOnDock = (chunk: string) => {
    const { isOpen, openPanel, appendText } = useDockStore.getState();
    if (!isOpen) openPanel();
    appendText(chunk);
  };

  return { streamTextOnDock };
}
