import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthYearSelectorProps {
  onMonthSelect: (month: string) => void;
  onYearSelect: (year: string) => void;
  currentMonth?: string;
  currentYear?: string;
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  onMonthSelect,
  onYearSelect,
  currentMonth = new Date().toISOString().slice(0, 7),
  currentYear = new Date().getFullYear().toString()
}) => {
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const currentDate = new Date();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return year.toString();
  });

  const [month, year] = currentMonth.split('-');

  const handleMonthChange = (newMonth: string) => {
    const newMonthYear = `${currentYear}-${newMonth}`;
    onMonthSelect(newMonthYear);
  };

  const handleYearChange = (newYear: string) => {
    onYearSelect(newYear);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentMonthDate = new Date(`${currentMonth}-01`);
    if (direction === 'prev') {
      currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    } else {
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    }
    
    const newMonthYear = currentMonthDate.toISOString().slice(0, 7);
    onMonthSelect(newMonthYear);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Sélection de période</h3>
      </div>

      {/* Navigation mensuelle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className="font-medium">
          {months.find(m => m.value === month)?.label} {year}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Sélecteurs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Mois</label>
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((monthItem) => (
                <SelectItem key={monthItem.value} value={monthItem.value}>
                  {monthItem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Année</label>
          <Select value={currentYear} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((yearItem) => (
                <SelectItem key={yearItem} value={yearItem}>
                  {yearItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default MonthYearSelector;