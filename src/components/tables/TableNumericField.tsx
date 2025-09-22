
import React from "react";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";

interface TableNumericFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

const TableNumericField: React.FC<TableNumericFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  required = false
}) => {
  const handleChange = (newValue: number) => {
    if (min !== undefined && newValue < min) {
      onChange(min);
      return;
    }
    if (max !== undefined && newValue > max) {
      onChange(max);
      return;
    }
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <NumericInput
        id={label.toLowerCase()}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full"
      />
      {min !== undefined && (
        <p className="text-xs text-muted-foreground">
          Minimum : {min}
        </p>
      )}
    </div>
  );
};

export default TableNumericField;
