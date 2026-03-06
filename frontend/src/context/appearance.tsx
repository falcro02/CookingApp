import {createContext, useContext, useEffect, useState} from "react";

const APPEARANCE_KEY = "theme-appearance";

interface AppearanceContextType {
  appearance: "light" | "dark";
  setAppearance: (appearance: "light" | "dark") => void;
}

const AppearanceContext = createContext<AppearanceContextType | null>(null);

export const AppearanceProvider = ({children}) => {
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

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be in AppearanceProvider");
  return context;
};
