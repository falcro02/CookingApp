import App from "./App";
import PageProvider from "@context/PageProvider";
import AppearanceProvider from "@context/AppearanceProvider";
import UserProvider from "@context/UserProvider";
import AuthProvider from "@context/AuthProvider";
import {StrictMode} from "react";
import {BrowserRouter} from "react-router-dom";
import {createRoot} from "react-dom/client";
import {Amplify} from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import "@radix-ui/themes/styles.css";
import {Authenticator, ThemeProvider} from "@aws-amplify/ui-react";

if (import.meta.env.DEV) console.log("[DEV ENV]");

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID!,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN!,
          scopes: ["phone", "email", "profile", "openid"],
          redirectSignIn: [import.meta.env.VITE_SITE_URL!],
          redirectSignOut: [import.meta.env.VITE_SITE_URL!],
          responseType: "code",
        },
      },
    },
  },
});

export const AuthDev = ({children}) => {
  if (import.meta.env.DEV)
    return (
      <ThemeProvider>
        <AuthProvider
          user={{
            userId: "DEV userId",
          }}
          signOut={() => {
            console.log("DEV: auth is bypassed");
          }}
        >
          {children}
        </AuthProvider>
      </ThemeProvider>
    );
  else
    return (
      <ThemeProvider>
        <Authenticator
          socialProviders={["google"]}
          loginMechanisms={["email"]}
          variation="modal"
        >
          {({signOut, user}) => (
            <AuthProvider user={user} signOut={signOut}>
              {children}
            </AuthProvider>
          )}
        </Authenticator>
      </ThemeProvider>
    );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthDev>
      <AppearanceProvider>
        <UserProvider>
          <BrowserRouter>
            <PageProvider>
              <App />
            </PageProvider>
          </BrowserRouter>
        </UserProvider>
      </AppearanceProvider>
    </AuthDev>
  </StrictMode>,
);
