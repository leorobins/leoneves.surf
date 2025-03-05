import { createContext, useContext, useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProviderContext = createContext({});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Always force dark mode
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  return (
    <ThemeProviderContext.Provider value={{}} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Keep this to avoid breaking any existing imports
export const useTheme = () => useContext(ThemeProviderContext);
