
import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface NumericInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: number | string;
  onChange?: (value: number) => void;
  placeholder?: string;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(value ? String(value) : "");
      }
    }, [value, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const numValue = parseFloat(displayValue) || 0;
      onChange?.(numValue);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Permettre seulement les nombres et un point décimal
      if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
        setDisplayValue(inputValue);
        if (inputValue !== "") {
          const numValue = parseFloat(inputValue) || 0;
          onChange?.(numValue);
        }
      }
    };

    return (
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
