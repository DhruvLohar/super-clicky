import { memo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDockStore } from "./stores/dockStore";

function Dock() {
  const isHovered = useDockStore((s) => s.isHovered);
  const setHovered = useDockStore((s) => s.setHovered);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        className="flex items-center pointer-events-auto"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="mr-3 rounded-full bg-[#18191b] px-4 py-2.5 text-white pointer-events-auto"
              style={{ fontSize: 16, whiteSpace: "nowrap" }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              Hold{" "}
              <span className="text-[#f7a76e]">ctrl + alt</span>
              {" "}to ask your doubt,{" "}
              <span className="text-[#f7a76e]">ctrl + shift</span>
              {" "}to exit
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="rounded-full border border-[#793606] bg-[#301602] w-2"
          animate={{
            height: isHovered ? 44 : 96,
            opacity: isHovered ? 0.8 : 0.5,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        />
      </div>
    </div>
  );
}

export default memo(Dock);
