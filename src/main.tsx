import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import { StoryProvider } from "./state/StoryContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <StoryProvider>
        <App />
      </StoryProvider>
    </LanguageProvider>
  </StrictMode>
);
