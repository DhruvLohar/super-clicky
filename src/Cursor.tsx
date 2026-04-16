import * as React from "react";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import logo from "./assets/Logo.webp";

function Cursor() {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const unlisten = listen<boolean>("recording-state", (e) => {
      setRecording(e.payload);
    });
    return () => { unlisten.then((f) => f()); };
  }, []);

  return (
    <img
      src={logo}
      width={24}
      className={`pointer-events-none${recording ? " recording-spin" : ""}`}
      alt="Cursorly Logo"
    />
  );
}

export default React.memo(Cursor);
