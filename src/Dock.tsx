import { memo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDockStore } from "./stores/dockStore";
import { startPipelineListener } from "./ai/pipeline";
import StreamPanel from "./StreamPanel";

function Dock() {
  const isHovered = useDockStore((s) => s.isHovered);
  const isOpen = useDockStore((s) => s.isOpen);
  const setHovered = useDockStore((s) => s.setHovered);
  const togglePanel = useDockStore((s) => s.togglePanel);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cleanup = startPipelineListener();
    return cleanup;
  }, []);

  const handleEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  }, [setHovered]);

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHovered(false), 200);
  }, [setHovered]);

  return (
    <div className="flex h-screen w-screen items-center justify-end overflow-hidden bg-transparent pointer-events-none">
      <div
        className="flex flex-col items-end pointer-events-none"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className="flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <StreamPanel key="panel" />
            ) : isHovered ? (
              <motion.div
                key="tooltip"
                className="mr-3 rounded-full bg-[#18191b] px-4 py-2.5 text-white pointer-events-auto"
                style={{ fontSize: 16, whiteSpace: "nowrap" }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
              >
                Press{" "}
                <span className="text-[#f7a76e]">Ctrl + Alt + R</span>
                {" "}to ask your doubt,{" "}
                <span className="text-[#f7a76e]">Ctrl + Shift + Q</span>
                {" "}to exit
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.div
            className="rounded-full border border-[#793606] bg-[#301602] w-2 pointer-events-auto cursor-pointer"
            animate={{
              height: isHovered ? 44 : 96,
              opacity: isHovered ? 0.8 : 0.5,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={togglePanel}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(Dock);
