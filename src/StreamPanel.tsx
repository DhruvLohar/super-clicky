import { memo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useDockStore } from "./stores/dockStore";
import Logo from "./assets/Logo.webp";

function StreamPanel() {
  const userQuery = useDockStore((s) => s.userQuery);
  const streamedText = useDockStore((s) => s.streamedText);
  const closePanel = useDockStore((s) => s.closePanel);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText]);

  return (
    <motion.div
      className="mr-3 w-[429px] rounded-[12px] bg-[#18191b] overflow-hidden flex flex-col pointer-events-auto"
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ maxHeight: 540 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#18191b] shrink-0">
        <img src={Logo} alt="Logo" className="w-[20px] h-[20px] object-contain" />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-[5px]">
            <span className="text-[#61656b] text-[11px]">Press</span>
            <span className="bg-[rgba(60,63,67,0.4)] border border-[#3c3f43] rounded-[3px] px-[4px] py-[1px] text-[#61656b] text-[11px]">Ctrl+Alt+Q</span>
            <span className="text-[#61656b] text-[11px]">to ask more</span>
          </div>
          <button
            onClick={closePanel}
            className="text-[#61656b] hover:text-white text-[13px] leading-none transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Chat body */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-y-auto px-4 py-3 space-y-3"
          style={{ maxHeight: 460, scrollbarWidth: "thin", scrollbarColor: "#61656b transparent" }}
        >
          {/* User message */}
          {userQuery && (
            <div className="flex justify-end">
              <div className="bg-[#2a2b2e] rounded-[10px] rounded-tr-[3px] px-3 py-2 max-w-[85%]">
                <p className="text-[#c4c4c4] text-[13px] leading-[1.4]">{userQuery}</p>
              </div>
            </div>
          )}

          {/* AI response */}
          {streamedText ? (
            <div className="flex justify-start">
              <div className="max-w-full">
                <div className="text-white text-[14px] leading-[1.55]">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-[16px] font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-[15px] font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-[14px] font-semibold mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      code: ({ children, className }) =>
                        className ? (
                          <code className="block bg-[#0d0e0f] rounded-[6px] px-3 py-2 text-[13px] font-mono overflow-x-auto mb-2">{children}</code>
                        ) : (
                          <code className="bg-[#0d0e0f] rounded-[3px] px-1 text-[13px] font-mono">{children}</code>
                        ),
                      pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#61656b] pl-3 text-[#9ca3af] mb-2">{children}</blockquote>
                      ),
                    }}
                  >
                    {streamedText}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : userQuery ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#61656b] animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#61656b] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#61656b] animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-[#61656b] text-[13px]">Thinking...</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[32px] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #18191b)" }}
        />
      </div>
    </motion.div>
  );
}

export default memo(StreamPanel);
