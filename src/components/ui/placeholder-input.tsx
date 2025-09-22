
import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PlaceholderInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
}

const PlaceholderInput = React.forwardRef<HTMLInputElement, PlaceholderInputProps>(
  ({ className, value, onValueChange, placeholder, ...props }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value || "");

    // Synchroniser avec la valeur externe seulement au premier rendu
    React.useEffect(() => {
      if (value !== undefined && localValue === "") {
        setLocalValue(value);
      }
    }, [value]);

    const handleClick = () => {
      setIsEditing(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    };

    const handleBlur = () => {
      setIsEditing(false);
      onValueChange?.(localValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsEditing(false);
        onValueChange?.(localValue);
      }
      if (e.key === 'Escape') {
        setIsEditing(false);
        setLocalValue(value || "");
      }
    };

    // Si on est en train d'éditer, afficher l'input
    if (isEditing) {
      return (
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          ref={ref}
          {...props}
        />
      )
    }

    // Afficher la valeur locale si elle existe, sinon le placeholder
    if (localValue && localValue.trim() !== "") {
      return (
        <div
          onClick={handleClick}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background cursor-text hover:bg-muted/50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
        >
          {localValue}
        </div>
      );
    }

    // Sinon, afficher le placeholder
    return (
      <div
        onClick={handleClick}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background cursor-text hover:bg-muted/50 transition-colors",
          "text-muted-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      >
        {placeholder}
      </div>
    );
  }
)
PlaceholderInput.displayName = "PlaceholderInput"

export { PlaceholderInput }
