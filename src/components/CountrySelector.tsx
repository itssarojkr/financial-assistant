import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { SecureApiClient } from '@/infrastructure/api/SecureApiClient';
import { useAsyncError } from '@/hooks/use-error-boundary';
import { ArrowRight, Loader2, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
  region: string;
}

interface State {
  id: number;
  name: string;
  code?: string;
  country_id: number;
}

interface City {
  id: number;
  name: string;
  state_id: number;
  population?: number;
}

interface Locality {
  id: number;
  name: string;
  city_id: number;
}

interface SalaryData {
  country: string;
  countryCode: string;
  state: string;
  stateId: string;
  city: string;
  cityId: string;
  locality: string;
  localityId: string;
  isNative: boolean;
  grossSalary: number;
  currency: string;
}

interface LocationSelectorProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
  onNext?: () => void;
  salaryValid?: boolean;
  onLoadCalculation?: () => void;
  showLoadButton?: boolean;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  salaryData,
  setSalaryData,
  onNext,
  salaryValid = false,
  onLoadCalculation,
  showLoadButton = false,
  disabled = false,
}) => {
  const { handleAsyncError } = useAsyncError();
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');

  // Fetch countries
  const { data: countriesData, isLoading: countriesLoading, error: countriesError } = useQuery({
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
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch states for selected country
  const { data: statesData, isLoading: statesLoading } = useQuery({
    queryKey: ['states', selectedCountryId],
    queryFn: async () => {
      if (!selectedCountryId) return [];
      try {
        const result = await SecureApiClient.getStates(selectedCountryId);
        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch states');
        }
        return result.data as State[];
      } catch (err) {
        handleAsyncError(err as Error, 'state selector');
        return [];
      }
    },
    enabled: !!selectedCountryId,
    staleTime: 1000 * 60 * 30,
  });

  // Fetch cities for selected state
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', salaryData.stateId],
    queryFn: async () => {
      if (!salaryData.stateId) return [];
      try {
        const result = await SecureApiClient.getCities(salaryData.stateId);
        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch cities');
        }
        return result.data as City[];
      } catch (err) {
        handleAsyncError(err as Error, 'city selector');
        return [];
      }
    },
    enabled: !!salaryData.stateId,
    staleTime: 1000 * 60 * 30,
  });

  // Fetch localities for selected city
  const { data: localitiesData, isLoading: localitiesLoading } = useQuery({
    queryKey: ['localities', salaryData.cityId],
    queryFn: async () => {
      if (!salaryData.cityId) return [];
      try {
        const result = await SecureApiClient.getLocalities(salaryData.cityId);
        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch localities');
        }
        return result.data as Locality[];
      } catch (err) {
        handleAsyncError(err as Error, 'locality selector');
        return [];
      }
    },
    enabled: !!salaryData.cityId,
    staleTime: 1000 * 60 * 30,
  });

  const handleCountryChange = (countryId: string) => {
    try {
      const selectedCountry = countriesData?.find(country => country.id.toString() === countryId);
      if (selectedCountry) {
        setSelectedCountryId(countryId);
        setSalaryData({
          ...salaryData,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          currency: selectedCountry.currency,
          // Reset location-specific fields when country changes
          state: '',
          stateId: '',
          city: '',
          cityId: '',
          locality: '',
          localityId: '',
          isNative: false
        });
      }
    } catch (error) {
      handleAsyncError(error as Error, 'country selection change');
    }
  };

  const handleStateChange = (stateId: string) => {
    try {
      const selectedState = statesData?.find(state => state.id.toString() === stateId);
      if (selectedState) {
        setSalaryData({
          ...salaryData,
          state: selectedState.name,
          stateId: stateId,
          // Reset city and locality when state changes
          city: '',
          cityId: '',
          locality: '',
          localityId: '',
        });
      }
    } catch (error) {
      handleAsyncError(error as Error, 'state selection change');
    }
  };

  const handleCityChange = (cityId: string) => {
    try {
      const selectedCity = citiesData?.find(city => city.id.toString() === cityId);
      if (selectedCity) {
        setSalaryData({
          ...salaryData,
          city: selectedCity.name,
          cityId: cityId,
          // Reset locality when city changes
          locality: '',
          localityId: '',
        });
      }
    } catch (error) {
      handleAsyncError(error as Error, 'city selection change');
    }
  };

  const handleLocalityChange = (localityId: string) => {
    try {
      const selectedLocality = localitiesData?.find(locality => locality.id.toString() === localityId);
      if (selectedLocality) {
        setSalaryData({
          ...salaryData,
          locality: selectedLocality.name,
          localityId: localityId,
        });
      }
    } catch (error) {
      handleAsyncError(error as Error, 'locality selection change');
    }
  };

  // Set initial country ID when salaryData.country changes
  useEffect(() => {
    if (salaryData.country && !selectedCountryId) {
      // Find the country by name and set the ID
      const country = countriesData?.find(c => c.name === salaryData.country);
      if (country) {
        setSelectedCountryId(country.id.toString());
      }
    }
  }, [salaryData.country, selectedCountryId, countriesData]);

  if (countriesError) {
    return (
      <div className="space-y-2">
        <Label>Location</Label>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load countries. Please refresh the page and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        
        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country-select">Country/Region *</Label>
          <Select
            value={selectedCountryId}
            onValueChange={handleCountryChange}
            disabled={disabled || countriesLoading}
          >
            <SelectTrigger id="country-select" className="w-full">
              <SelectValue placeholder={countriesLoading ? "Loading countries..." : "Select a country"} />
            </SelectTrigger>
            <SelectContent>
              {countriesData?.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name} ({country.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State/Province Selection */}
        {selectedCountryId && (
          <div className="space-y-2">
            <Label htmlFor="state-select">State/Province</Label>
            <Select
              value={salaryData.stateId}
              onValueChange={handleStateChange}
              disabled={disabled || statesLoading}
            >
              <SelectTrigger id="state-select" className="w-full">
                <SelectValue placeholder={statesLoading ? "Loading states..." : "Select a state/province"} />
              </SelectTrigger>
              <SelectContent>
                {statesData?.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* City Selection */}
        {salaryData.stateId && (
          <div className="space-y-2">
            <Label htmlFor="city-select">City</Label>
            <Select
              value={salaryData.cityId}
              onValueChange={handleCityChange}
              disabled={disabled || citiesLoading}
            >
              <SelectTrigger id="city-select" className="w-full">
                <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select a city"} />
              </SelectTrigger>
              <SelectContent>
                {citiesData && citiesData.length > 0 ? (
                  citiesData.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No cities available for this state
                  </div>
                )}
              </SelectContent>
            </Select>
            {citiesData && citiesData.length === 0 && !citiesLoading && (
              <p className="text-xs text-muted-foreground">
                Cities data not available. You can proceed with just the state selection.
              </p>
            )}
          </div>
        )}

        {/* Locality Selection */}
        {salaryData.cityId && (
          <div className="space-y-2">
            <Label htmlFor="locality-select">District/Neighborhood</Label>
            <Select
              value={salaryData.localityId}
              onValueChange={handleLocalityChange}
              disabled={disabled || localitiesLoading}
            >
              <SelectTrigger id="locality-select" className="w-full">
                <SelectValue placeholder={localitiesLoading ? "Loading localities..." : "Select a district/neighborhood"} />
              </SelectTrigger>
              <SelectContent>
                {localitiesData && localitiesData.length > 0 ? (
                  localitiesData.map((locality) => (
                    <SelectItem key={locality.id} value={locality.id.toString()}>
                      {locality.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No localities available for this city
                  </div>
                )}
              </SelectContent>
            </Select>
            {localitiesData && localitiesData.length === 0 && !localitiesLoading && (
              <p className="text-xs text-muted-foreground">
                Locality data not available. You can proceed with just the city selection.
              </p>
            )}
          </div>
        )}

        {/* Native Status */}
        <div className="flex items-center gap-3 py-2">
          <Switch
            id="native-status-toggle"
            checked={salaryData.isNative}
            onCheckedChange={(checked) => setSalaryData({
              ...salaryData,
              isNative: checked
            })}
            disabled={disabled}
          />
          <User className="w-5 h-5 text-muted-foreground" />
          <Label htmlFor="native-status-toggle" className="text-base font-medium select-none cursor-pointer">
            Native/Permanent Resident
          </Label>
        </div>

        {/* Loading indicators */}
        {(countriesLoading || statesLoading || citiesLoading || localitiesLoading) && (
          <p className="text-xs text-muted-foreground">Loading location data...</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {onNext && salaryData.country && salaryValid && (
          <Button
            onClick={onNext}
            className="w-full"
            disabled={disabled}
          >
            Continue to Tax Calculation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {showLoadButton && onLoadCalculation && (
          <Button
            type="button"
            variant="outline"
            onClick={onLoadCalculation}
            className="w-full"
            disabled={disabled}
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Load Saved Calculation
          </Button>
        )}
      </div>
    </div>
  );
};

// Export both names for backward compatibility
export const CountrySelector = LocationSelector;
