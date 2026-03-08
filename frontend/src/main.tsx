import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import "@radix-ui/themes/styles.css";
import PageProvider from "@context/PageProvider";
import AppearanceProvider from "@context/AppearanceProvider";
import {BrowserRouter} from "react-router-dom";
import UserProvider from "@context/UserProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppearanceProvider>
      <UserProvider>
        <BrowserRouter>
          <PageProvider>
            <App />
          </PageProvider>
        </BrowserRouter>
      </UserProvider>
    </AppearanceProvider>
  </StrictMode>,
);
