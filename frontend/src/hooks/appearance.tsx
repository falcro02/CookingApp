import {createContext, useContext} from "react";

interface AppearanceContextType {
  appearance: "light" | "dark";
  setAppearance: (appearance: "light" | "dark") => void;
}

export const AppearanceContext = createContext<AppearanceContextType | null>(
  null,
);

const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be in AppearanceProvider");
  return context;
};

export default useAppearance;
