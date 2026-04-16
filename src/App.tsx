import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="m-0 flex flex-col justify-center pt-[10vh] text-center font-sans text-base leading-6 text-gray-900 antialiased dark:text-gray-100">
      <h1 className="text-center">Welcome to Tauri + React</h1>

      <div className="flex justify-center">
        <a href="https://vite.dev" target="_blank" className="font-medium text-indigo-400 no-underline hover:text-indigo-300">
          <img src="/vite.svg" className="h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_2em_#747bff]" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" className="font-medium text-indigo-400 no-underline hover:text-indigo-300">
          <img src="/tauri.svg" className="h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_2em_#24c8db]" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="font-medium text-indigo-400 no-underline hover:text-indigo-300">
          <img src={reactLogo} className="h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_2em_#61dafb]" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          className="mr-1.5 rounded-lg border border-transparent bg-white px-5 py-2.5 text-base font-medium shadow-sm outline-none dark:bg-gray-900 dark:text-white"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg border border-transparent bg-white px-5 py-2.5 text-base font-medium shadow-sm outline-none hover:border-blue-600 active:border-blue-600 active:bg-gray-200 dark:bg-gray-900 dark:text-white dark:active:bg-gray-800"
        >
          Greet
        </button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
