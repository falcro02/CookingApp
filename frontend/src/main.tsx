import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import "@radix-ui/themes/styles.css";
import {PageProvider} from "@context/page";
import {AppearanceProvider} from "@context/appearance";
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppearanceProvider>
      <BrowserRouter>
        <PageProvider>
          <App />
        </PageProvider>
      </BrowserRouter>
    </AppearanceProvider>
  </StrictMode>,
);
