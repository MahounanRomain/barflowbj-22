
import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface StableInputProps extends React.ComponentProps<"input"> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const StableInput = React.forwardRef<HTMLInputElement, StableInputProps>(
  ({ className, value, onValueChange, onChange, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value || "");
    const [hasFocus, setHasFocus] = useState(false);

    // Synchroniser avec la valeur externe seulement si le champ n'a pas le focus
    useEffect(() => {
      if (!hasFocus && value !== undefined) {
        setLocalValue(value);
      }
    }, [value, hasFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onValueChange?.(newValue);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasFocus(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasFocus(false);
      // Synchroniser avec la valeur externe au blur
      if (onValueChange && localValue !== value) {
        onValueChange(localValue);
      }
      props.onBlur?.(e);
    };

    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    )
  }
)
StableInput.displayName = "StableInput"

export { StableInput }
