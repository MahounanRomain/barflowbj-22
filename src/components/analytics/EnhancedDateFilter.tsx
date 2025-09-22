import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MonthYearSelector from './MonthYearSelector';

interface EnhancedDateFilterProps {
  onFilterChange: (filter: DateFilter) => void;
  currentFilter: DateFilter;
}

export interface DateFilter {
  type: 'preset' | 'custom';
  preset?: '7d' | '14d' | '21d' | '30d' | '90d' | 'monthly' | 'yearly' | 'all';
  startDate?: string;
  endDate?: string;
  label: string;
  month?: string;
  year?: string;
}

const EnhancedDateFilter: React.FC<EnhancedDateFilterProps> = ({ 
  onFilterChange, 
  currentFilter 
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear().toString();

  const presetFilters: DateFilter[] = [
    { type: 'preset', preset: '7d', label: '7d' },
    { type: 'preset', preset: '14d', label: '14d' },
    { type: 'preset', preset: '21d', label: '21d' },
    { type: 'preset', preset: 'monthly', label: 'Month', month: currentMonth },
    { type: 'preset', preset: 'yearly', label: 'Year', year: currentYear },
    { type: 'preset', preset: 'all', label: 'All time' }
  ];

  const handlePresetClick = (filter: DateFilter) => {
    setShowCustom(false);
    setShowMonthSelector(false);
    setShowYearSelector(false);
    onFilterChange(filter);
  };

  const handleMonthSelect = (month: string) => {
    const filter: DateFilter = {
      type: 'preset',
      preset: 'monthly',
      month,
      label: `${new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    };
    onFilterChange(filter);
    setShowMonthSelector(false);
  };

  const handleYearSelect = (year: string) => {
    const filter: DateFilter = {
      type: 'preset',
      preset: 'yearly',
      year,
      label: `Année ${year}`
    };
    onFilterChange(filter);
    setShowYearSelector(false);
  };

  const handleCustomFilter = () => {
    if (customStart && customEnd) {
      const filter: DateFilter = {
        type: 'custom',
        startDate: customStart,
        endDate: customEnd,
        label: `${new Date(customStart).toLocaleDateString('fr-FR')} - ${new Date(customEnd).toLocaleDateString('fr-FR')}`
      };
      onFilterChange(filter);
      setShowCustom(false);
    }
  };

  const clearCustomFilter = () => {
    setCustomStart('');
    setCustomEnd('');
    setShowCustom(false);
    onFilterChange(presetFilters[0]);
  };

  return (
    <div className="space-y-3">
      {/* Preset Filters */}
      <div className="flex flex-wrap gap-2">
        {presetFilters.map((filter) => (
          <Button
            key={filter.preset}
            variant={currentFilter.preset === filter.preset && currentFilter.type === 'preset' ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (filter.preset === 'monthly') {
                setShowMonthSelector(!showMonthSelector);
                setShowCustom(false);
                setShowYearSelector(false);
              } else if (filter.preset === 'yearly') {
                setShowYearSelector(!showYearSelector);
                setShowCustom(false);
                setShowMonthSelector(false);
              } else {
                handlePresetClick(filter);
              }
            }}
          >
            {filter.label}
          </Button>
        ))}
        <Button
          variant={showCustom ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowCustom(!showCustom);
            setShowMonthSelector(false);
            setShowYearSelector(false);
          }}
        >
          <Calendar className="w-4 h-4 mr-1" />
          Personalized
        </Button>
      </div>

      {/* Current Filter Badge */}
      {currentFilter.type === 'custom' && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Filter className="w-3 h-3" />
            {currentFilter.label}
            <button
              onClick={clearCustomFilter}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Month Selector */}
      {showMonthSelector && (
        <MonthYearSelector
          onMonthSelect={handleMonthSelect}
          onYearSelect={handleYearSelect}
          currentMonth={currentFilter.month || currentMonth}
          currentYear={currentFilter.year || currentYear}
        />
      )}

      {/* Year Selector */}
      {showYearSelector && (
        <Card className="p-4 space-y-3">
          <h3 className="font-medium">Sélection d'année</h3>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 5 }, (_, i) => {
              const year = (new Date().getFullYear() - 2 + i).toString();
              return (
                <Button
                  key={year}
                  variant={currentFilter.year === year ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowYearSelector(false)}
            size="sm"
            className="w-full"
          >
            Annuler
          </Button>
        </Card>
      )}

      {/* Custom Date Range */}
      {showCustom && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date de début</label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={customEnd || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date de fin</label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCustomFilter}
              disabled={!customStart || !customEnd}
              size="sm"
            >
              Appliquer
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCustom(false)}
              size="sm"
            >
              Annuler
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDateFilter;