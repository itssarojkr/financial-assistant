import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { SecureApiClient } from '@/infrastructure/api/SecureApiClient';
import { useAsyncError } from '@/hooks/use-error-boundary';
import { ArrowRight, Loader2, User, FolderOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  // Add state for validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function validateField(field: string, value: string) {
    let error = '';
    if (field === 'country' && !value) error = 'Country is required.';
    if (field === 'state' && !value) error = 'State is required.';
    if (field === 'city' && !value) error = 'City is required.';
    // Add more as needed
    setErrors(prev => ({ ...prev, [field]: error }));
  }

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
        validateField('country', countryId);
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
        validateField('state', stateId);
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
        validateField('city', cityId);
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
          <Label htmlFor="country-select" aria-label="Select your country of residence">Country <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-help">?</span></TooltipTrigger><TooltipContent>Select your country of residence for accurate tax calculation.</TooltipContent></Tooltip></Label>
          {countriesLoading ? (
            <Skeleton className="h-10 w-full max-w-md" />
          ) : (
            <Select
              value={selectedCountryId}
              onValueChange={handleCountryChange}
              disabled={disabled || countriesLoading}
              aria-label="Select your country of residence"
            >
              <SelectTrigger className="w-full max-w-md" aria-label="Select your country of residence">
                <SelectValue placeholder={countriesLoading ? "Loading countries..." : "Select a country"} aria-label="Select your country of residence" />
                {countriesLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </SelectTrigger>
              <SelectContent>
                {countriesData?.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()} aria-label={`Select ${country.name}`}>
                    {country.name} ({country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.country && <p className="text-red-500 text-xs mt-1" role="alert" aria-live="polite" aria-label="Country error message">{errors.country}</p>}
        </div>

        {/* State/Province Selection */}
        {selectedCountryId && (
          <div className="space-y-2">
            <Label htmlFor="state-select" aria-label="Select your state or province">State <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-help">?</span></TooltipTrigger><TooltipContent>Select your state or province if applicable.</TooltipContent></Tooltip></Label>
            {statesLoading ? (
              <Skeleton className="h-10 w-full max-w-md" />
            ) : (
              <Select
                value={salaryData.stateId}
                onValueChange={handleStateChange}
                disabled={disabled || statesLoading}
                aria-label="Select your state or province"
              >
                <SelectTrigger className="w-full max-w-md" aria-label="Select your state or province">
                  <SelectValue placeholder={statesLoading ? "Loading states..." : "Select a state/province"} aria-label="Select your state or province" />
                  {statesLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </SelectTrigger>
                <SelectContent>
                  {statesData?.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()} aria-label={`Select ${state.name}`}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.state && <p className="text-red-500 text-xs mt-1" role="alert" aria-live="polite" aria-label="State error message">{errors.state}</p>}
          </div>
        )}

        {/* City Selection */}
        {salaryData.stateId && (
          <div className="space-y-2">
            <Label htmlFor="city-select" aria-label="Select your city">City <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-help">?</span></TooltipTrigger><TooltipContent>Select your city for more precise results.</TooltipContent></Tooltip></Label>
            {citiesLoading ? (
              <Skeleton className="h-10 w-full max-w-md" />
            ) : (
              <Select
                value={salaryData.cityId}
                onValueChange={handleCityChange}
                disabled={disabled || citiesLoading}
                aria-label="Select your city"
              >
                <SelectTrigger className="w-full max-w-md" aria-label="Select your city">
                  <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select a city"} aria-label="Select your city" />
                  {citiesLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </SelectTrigger>
                <SelectContent>
                  {citiesData && citiesData.length > 0 ? (
                    citiesData.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()} aria-label={`Select ${city.name}`}>
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
            )}
            {errors.city && <p className="text-red-500 text-xs mt-1" role="alert" aria-live="polite" aria-label="City error message">{errors.city}</p>}
            {citiesData && citiesData.length === 0 && !citiesLoading && (
              <p className="text-xs text-muted-foreground">
                Cities data not available. You can proceed with just the state selection.
              </p>
            )}
          </div>
        )}

        {/* Locality Selection */}
        <Label htmlFor="locality-input" aria-label="Enter or select your district/neighborhood">Locality <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-help">?</span></TooltipTrigger><TooltipContent>Type or select your district/neighborhood (optional).</TooltipContent></Tooltip></Label>
        <input
          id="locality-input"
          type="text"
          className="input w-full max-w-md"
          list="locality-suggestions"
          value={salaryData.locality}
          onChange={e => {
            setSalaryData({ ...salaryData, locality: e.target.value, localityId: '' });
            validateField('locality', e.target.value);
          }}
          placeholder="Type or select a locality"
          autoComplete="off"
          aria-label="Enter or select your district/neighborhood"
          aria-describedby="locality-error"
        />
        <datalist id="locality-suggestions">
          {localitiesData?.map(locality => (
            <option key={locality.id} value={locality.name} aria-label={`Select ${locality.name}`} />
          ))}
        </datalist>
        {errors.locality && <p id="locality-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite" aria-label="Locality error message">{errors.locality}</p>}
        {!localitiesData?.length && (
          <div className="text-xs text-muted-foreground mt-1">Locality data not available. You can proceed with just the city selection.</div>
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
            aria-label="Native/Permanent Resident status"
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
            className="w-full min-h-[44px] touch-manipulation"
            disabled={disabled || !salaryData.country || !salaryData.state || !salaryData.city || countriesLoading || statesLoading || citiesLoading}
            tabIndex={0}
            aria-label="Continue to tax calculation"
          >
            {countriesLoading || statesLoading || citiesLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Continue to Tax Calculation
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}

        {showLoadButton && onLoadCalculation && (
          <Button
            type="button"
            variant="outline"
            onClick={onLoadCalculation}
            className="w-full min-h-[44px] touch-manipulation"
            disabled={disabled}
            tabIndex={0}
            aria-label="Load saved calculation"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Load Saved Calculation
          </Button>
        )}
      </div>
    </div>
  );
};

// Export both names for backward compatibility
export const CountrySelector = LocationSelector;
