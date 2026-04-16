import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Dock from "./Dock";
import Cursor from "./Cursor";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dock" element={<Dock />} />
        <Route path="/cursor" element={<Cursor />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
