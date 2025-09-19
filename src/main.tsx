import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 Starting NFTFlow application...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('✅ Rendering App component...');
  root.render(<App />);
  
  console.log('🎉 NFTFlow application started successfully');
} catch (error) {
  console.error('❌ Failed to start NFTFlow application:', error);
  
  // Fallback: show error message
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">NFTFlow Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Failed to load the application</p>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; max-width: 600px;">
          <pre style="text-align: left; font-size: 0.9rem; overflow-x: auto;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
        </div>
        <button 
          onclick="window.location.reload()" 
          style="
            margin-top: 20px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Reload Page
        </button>
      </div>
    `;
  }
}
