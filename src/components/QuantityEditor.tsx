
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Minus, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityEditorProps {
  currentQuantity: number;
  itemName: string;
  onSave: (newQuantity: number) => void;
  onCancel: () => void;
  className?: string;
}

const QuantityEditor: React.FC<QuantityEditorProps> = ({
  currentQuantity,
  itemName,
  onSave,
  onCancel,
  className
}) => {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    if (quantity !== currentQuantity) {
      setIsAnimating(true);
      setTimeout(() => {
        onSave(quantity);
        setIsAnimating(false);
      }, 300);
    } else {
      onCancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(0, quantity + delta);
    setQuantity(newQuantity);
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800",
      "animate-scale-in",
      isAnimating && "animate-pulse",
      className
    )}>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => adjustQuantity(-1)}
          disabled={quantity <= 0}
        >
          <Minus size={14} />
        </Button>
        
        <NumericInput
          ref={inputRef}
          value={quantity}
          onChange={(value) => setQuantity(Math.max(0, value))}
          onKeyDown={handleKeyPress}
          className="w-20 h-8 text-center font-medium"
        />
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => adjustQuantity(1)}
        >
          <Plus size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="default"
          size="sm"
          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
          onClick={handleSave}
        >
          <Check size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onCancel}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};

export default QuantityEditor;
