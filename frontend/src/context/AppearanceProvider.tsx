import {AppearanceContext} from "@hooks/appearance";
import {useEffect, useState} from "react";

const APPEARANCE_KEY = "theme-appearance";

const AppearanceProvider = ({children}) => {
  const [appearance, setAppearance] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(APPEARANCE_KEY);
    return (saved as "light" | "dark") ?? "dark";
  });

  useEffect(() => {
    localStorage.setItem(APPEARANCE_KEY, appearance);
  }, [appearance]);

  return (
    <AppearanceContext.Provider value={{appearance, setAppearance}}>
      {children}
    </AppearanceContext.Provider>
  );
};

export default AppearanceProvider;
