import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContext.jsx";
import "./index.css";

// Polyfill for mgt.clearMarks is not a function
// Create global mgt object with dummy methods
if (!window.mgt) {
  window.mgt = {
    clearMarks: () => {},
    clearMeasures: () => {},
    mark: () => {},
    measure: () => {},
  };
}

// Wrap performance API methods to prevent errors if they don't exist
if (window.performance) {
  window.performance.clearMarks = window.performance.clearMarks || (() => {});
  window.performance.clearMeasures = window.performance.clearMeasures || (() => {});
  window.performance.mark = window.performance.mark || (() => {});
  window.performance.measure = window.performance.measure || (() => {});
}

// Global error handler to catch and suppress non-critical errors
window.addEventListener("error", (e) => {
  if (e.message?.includes?.("clearMarks is not a function") || 
      e.message?.includes?.("mgt.clearMarks")) {
    console.warn("Performance API error caught and suppressed:", e.message);
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <Toaster />
      <App />
    </AppContextProvider>
  </BrowserRouter>
);
