import { memo } from "react";
import { motion } from "motion/react";
import { useDockStore } from "./stores/dockStore";
import Logo from "./assets/Logo.webp";

function StreamPanel() {
  const streamedText = useDockStore((s) => s.streamedText);
  const closePanel = useDockStore((s) => s.closePanel);

  return (
    <motion.div
          className="mr-3 w-[429px] rounded-[12px] bg-[#18191b] overflow-hidden flex flex-col pointer-events-auto"
          initial={{ opacity: 0, height: 44 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 44 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ maxHeight: 460 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3f43] bg-[#18191b] shrink-0">
            <img src={Logo} alt="Logo" className="w-[24px] h-[24px] object-contain" />
            <div className="flex items-center justify-center gap-4 ml-auto">
              <div className="flex items-center gap-[6px]">
                <span className="text-white text-[12px]">Press</span>
                <span className="bg-[rgba(60,63,67,0.5)] border border-[#3c3f43] rounded-[4px] px-[5px] text-white text-[12px]">Ctrl</span>
                <span className="text-white text-[12px]">+</span>
                <span className="bg-[rgba(60,63,67,0.5)] border border-[#3c3f43] rounded-[4px] px-[5px] text-white text-[12px]">Alt</span>
                <span className="text-white text-[12px]">+</span>
                <span className="bg-[rgba(60,63,67,0.5)] border border-[#3c3f43] rounded-[4px] px-[5px] text-white text-[12px]">Q</span>
                <span className="text-white text-[12px]">to ask more</span>
              </div>
              <button
                onClick={closePanel}
                className="text-[#61656b] hover:text-white text-[14px] leading-none transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          {streamedText && (
            <div className="relative flex-1 overflow-hidden">
              <div
                className="overflow-y-auto px-4 py-3 text-white text-[15px] leading-[1.5] whitespace-pre-wrap"
                style={{ maxHeight: 400, scrollbarWidth: "thin", scrollbarColor: "#61656b #3c3f43" }}
              >
                {streamedText}
              </div>
              {/* Bottom gradient fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[42px] pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent, #18191b)",
                }}
              />
            </div>
          )}
    </motion.div>
  );
}

export default memo(StreamPanel);
