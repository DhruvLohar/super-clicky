import { useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";

function Dock() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-end overflow-hidden bg-transparent">
      <motion.button
        className="cursor-pointer rounded-t-lg border border-white/15 bg-white/10 px-4 py-0.5 text-[10px] text-white/70 shadow-none backdrop-blur-[10px] hover:border-transparent hover:bg-white/20"
        onClick={() => setIsVisible((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isVisible ? "▼" : "▲"}
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="dock-glass mb-1.5 flex items-center justify-center gap-3 rounded-2xl border border-white/18 bg-white/12 px-6 py-2.5 backdrop-blur-[20px]"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {["🚀", "⚡", "🎯"].map((icon) => (
              <motion.button
                key={icon}
                className="flex size-12 cursor-pointer items-center justify-center rounded-xl border-none bg-white/15 p-0 text-[22px] text-white shadow-md backdrop-blur-[10px] transition-colors duration-200 hover:border-transparent hover:bg-white/25"
                whileHover={{ scale: 1.2, y: -8 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(Dock);
