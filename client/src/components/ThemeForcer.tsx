import { useEffect } from "react";

export function ThemeForcer() {
  useEffect(() => {
    // Force dark mode by directly manipulating document classes
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    
    // No need for cleanup since we want dark mode everywhere now
    return () => {};
  }, []);

  return null; // This component doesn't render anything
} 