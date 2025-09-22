
import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SimpleNumericInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const SimpleNumericInput = React.forwardRef<HTMLInputElement, SimpleNumericInputProps>(
  ({ className, value = "", onValueChange, placeholder, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value);

    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Permettre seulement les nombres et un point décimal
      if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
        setInternalValue(newValue);
        onValueChange?.(newValue);
      }
    };

    return (
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    )
  }
)
SimpleNumericInput.displayName = "SimpleNumericInput"

export { SimpleNumericInput }
