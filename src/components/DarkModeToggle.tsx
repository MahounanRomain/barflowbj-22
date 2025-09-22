
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 hover:bg-accent/50 transition-all duration-300"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-500 transition-transform duration-300 hover:scale-110" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600 transition-transform duration-300 hover:scale-110" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
