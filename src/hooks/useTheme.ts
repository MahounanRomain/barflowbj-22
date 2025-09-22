
import React from 'react';
import { useTheme as useUITheme } from '@/components/ui/theme-provider';
import { useLocalData } from './useLocalData';

export const useTheme = () => {
  const { theme, setTheme } = useUITheme();
  const { getSettings, updateSettings } = useLocalData();
  
  const [isDark, setIsDark] = React.useState(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  });

  React.useEffect(() => {
    const newIsDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(newIsDark);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    updateSettings({ darkMode: newTheme === "dark" });
  };

  return { isDark, toggleTheme };
};
