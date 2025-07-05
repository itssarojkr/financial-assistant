
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { SecureApiClient } from '@/services/api-client';
import { useAsyncError } from '@/hooks/use-error-boundary';

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  region: string;
}

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (countryId: string) => void;
  disabled?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange,
  disabled = false,
}) => {
  const { handleAsyncError } = useAsyncError();

  const { data: countriesData, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      try {
        const result = await SecureApiClient.getCountries();
        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch countries');
        }
        return result.data as Country[];
      } catch (err) {
        handleAsyncError(err as Error, 'country selector');
        throw err;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - countries don't change often
  });

  const handleSelectionChange = (value: string) => {
    try {
      onCountryChange(value);
    } catch (error) {
      handleAsyncError(error as Error, 'country selection change');
    }
  };

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Country/Region</Label>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load countries. Please refresh the page and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="country-select">Country/Region</Label>
      <Select
        value={selectedCountry}
        onValueChange={handleSelectionChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="country-select" className="w-full">
          <SelectValue placeholder={isLoading ? "Loading countries..." : "Select a country"} />
        </SelectTrigger>
        <SelectContent>
          {countriesData?.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.name} ({country.currency})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading available countries...</p>
      )}
    </div>
  );
};
