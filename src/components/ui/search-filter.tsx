
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
}

export interface DateRange {
  from?: Date | undefined;
  to?: Date | undefined;
}

export type FilterValue = string | Date | DateRange | null;

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  activeFilters: Record<string, FilterValue>;
  onFilterChange: (key: string, value: FilterValue) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  searchPlaceholder = "Search...",
  className
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const renderFilterInput = (filter: FilterOption) => {
    const value = activeFilters[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select value={value as string || ''} onValueChange={(val) => onFilterChange(filter.key, val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value as Date, "PPP") : `Select ${filter.label.toLowerCase()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value as Date | undefined}
                onSelect={(date) => date && onFilterChange(filter.key, date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'dateRange': {
        const dateRange = value as DateRange | undefined;
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? format(dateRange.from, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => onFilterChange(filter.key, { ...dateRange, from: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.to ? format(dateRange.to, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(date) => onFilterChange(filter.key, { ...dateRange, to: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && "bg-primary/10 border-primary")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {Object.values(activeFilters).filter(v => v !== undefined && v !== null && v !== '').length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            let displayValue = '';
            if (filter.type === 'date' && value) {
              displayValue = format(value as Date, "MMM dd, yyyy");
            } else if (filter.type === 'dateRange' && value && typeof value === 'object' && 'from' in value) {
              const dateRange = value as DateRange;
              displayValue = `${format(dateRange.from!, "MMM dd")}${dateRange.to ? ` - ${format(dateRange.to, "MMM dd")}` : ''}`;
            } else if (filter.type === 'select' && value) {
              const option = filter.options?.find(opt => opt.value === value);
              displayValue = option?.label || String(value);
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {filter.label}: {displayValue}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onFilterChange(key, null)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
