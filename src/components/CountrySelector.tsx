import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, User } from 'lucide-react';
import { SalaryData } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

interface CountrySelectorProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
  onNext: () => void;
  salaryValid: boolean;
}

type Country = {
  id: number;
  code: string;
  name: string;
  currency: string;
  region: string;
};

type State = {
  id: number;
  country_id: number;
  name: string;
};

type City = {
  id: number;
  state_id: number;
  name: string;
};

type Locality = {
  id: number;
  city_id: number;
  name: string;
};

const CountrySelector: React.FC<CountrySelectorProps> = ({ salaryData, setSalaryData, onNext, salaryValid }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [cityInput, setCityInput] = useState(salaryData.city);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [localityInput, setLocalityInput] = useState(salaryData.locality || '');
  const [showLocalitySuggestions, setShowLocalitySuggestions] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Fetch countries on mount
  useEffect(() => {
    setLoadingCountries(true);
    supabase.from('countries').select('*').then(({ data, error }) => {
      if (!error && data) setCountries(data);
      setLoadingCountries(false);
    });
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!salaryData.country) {
      setStates([]);
      return;
    }
    const country = countries.find(c => c.name === salaryData.country);
    if (!country) return;
    setLoadingStates(true);
    supabase.from('states').select('*').eq('country_id', country.id).then(({ data, error }) => {
      if (!error && data) setStates(data);
      setLoadingStates(false);
    });
  }, [salaryData.country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!salaryData.state) {
      setCities([]);
      return;
    }
    const state = states.find(s => s.name === salaryData.state);
    if (!state) return;
    setLoadingCities(true);
    supabase.from('cities').select('*').eq('state_id', state.id).then(({ data, error }) => {
      if (!error && data) setCities(data);
      setLoadingCities(false);
    });
  }, [salaryData.state, states]);

  // Fetch localities when city changes
  useEffect(() => {
    if (!salaryData.city) {
      setLocalities([]);
      return;
    }
    const city = cities.find(c => c.name === salaryData.city);
    if (!city) return;
    setLoadingLocalities(true);
    supabase.from('localities').select('*').eq('city_id', city.id).then(({ data, error }) => {
      if (!error && data) setLocalities(data);
      setLoadingLocalities(false);
    });
  }, [salaryData.city, cities]);

  const getCitySuggestions = () => {
    if (!cityInput) return [];
    return cities.filter(city => city.name.toLowerCase().includes(cityInput.toLowerCase()));
  };

  const getLocalitySuggestions = () => {
    if (!localityInput) return [];
    return localities.filter(locality => locality.name.toLowerCase().includes(localityInput.toLowerCase()));
  };

  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setSalaryData({
        ...salaryData,
        country: countryName,
        currency: country.currency,
        state: '',
        city: '',
        locality: ''
      });
      setCityInput('');
      setLocalityInput('');
    }
    validateForm();
  };

  const handleStateChange = (stateId: string) => {
    const selectedState = states.find(s => s.id.toString() === stateId);
    setSalaryData({
      ...salaryData,
      state: selectedState ? selectedState.name : '',
      stateId: stateId,
      city: '',
      cityId: '',
      locality: '',
      localityId: ''
    });
    setCityInput('');
    setLocalityInput('');
    validateForm();
  };

  const handleCityChange = (cityName: string, cityId: string) => {
    setCityInput(cityName);
    setSalaryData({
      ...salaryData,
      city: cityName,
      cityId,
      locality: '',
      localityId: ''
    });
    setShowCitySuggestions(false);
    setLocalityInput('');
    validateForm();
    if (cityInputRef.current) cityInputRef.current.blur();
  };

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    setSalaryData({
      ...salaryData,
      city: value,
      cityId: '',
      locality: '',
      localityId: ''
    });
    setShowCitySuggestions(value.length > 0);
    setLocalityInput('');
    validateForm();
  };

  const handleLocalityChange = (localityName: string) => {
    setLocalityInput(localityName);
    setSalaryData({
      ...salaryData,
      locality: localityName
    });
    setShowLocalitySuggestions(false);
    validateForm();
  };

  const handleLocalityInputChange = (value: string) => {
    setLocalityInput(value);
    setSalaryData({
      ...salaryData,
      locality: value
    });
    setShowLocalitySuggestions(value.length > 0);
    validateForm();
  };

  const validateForm = () => {
    const isValid = salaryData.country && salaryData.state && cityInput.trim() && localityInput.trim();
    setIsFormValid(!!isValid);
  };

  // Group countries by region
  const groupedCountries = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as { [key: string]: Country[] });

  const citySuggestions = getCitySuggestions();
  const localitySuggestions = getLocalitySuggestions();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Location Details
        </CardTitle>
        <CardDescription>
          Select your work location and residency status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={salaryData.country} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder={loadingCountries ? 'Loading countries...' : 'Select a country'} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedCountries).map(([region, regionCountries]) => (
                <div key={region}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                    {region}
                  </div>
                  {regionCountries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {salaryData.country && (
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Select value={salaryData.stateId} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select a state/province'} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {salaryData.state && (
          <div className="space-y-2 relative">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder={loadingCities ? 'Loading cities...' : 'Enter your city'}
              value={cityInput}
              onChange={(e) => handleCityInputChange(e.target.value)}
              onFocus={() => setShowCitySuggestions(cityInput.length > 0)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              ref={cityInputRef}
            />
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
                {citySuggestions.map((city) => (
                  <div
                    key={city.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleCityChange(city.name, city.id.toString())}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {salaryData.city && (
          <div className="space-y-2 relative">
            <Label htmlFor="locality">Locality</Label>
            <Input
              id="locality"
              placeholder={loadingLocalities ? 'Loading localities...' : 'Enter your locality'}
              value={localityInput}
              onChange={(e) => handleLocalityInputChange(e.target.value)}
              onFocus={() => setShowLocalitySuggestions(localityInput.length > 0)}
              onBlur={() => setTimeout(() => setShowLocalitySuggestions(false), 200)}
            />
            {showLocalitySuggestions && localitySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
                {localitySuggestions.map((locality) => (
                  <div
                    key={locality.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleLocalityChange(locality.name)}
                  >
                    {locality.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="native-status"
            checked={salaryData.isNative}
            onCheckedChange={(checked) => setSalaryData({ ...salaryData, isNative: checked })}
          />
          <Label htmlFor="native-status" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {salaryData.isNative ? 'Native/Permanent Resident' : 'Foreign Worker'}
          </Label>
        </div>

        {!salaryData.isNative && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Foreign workers may be subject to additional taxes and different tax brackets.
            </p>
          </div>
        )}

        <Button
          className="mt-6 w-full"
          onClick={onNext}
          disabled={!salaryValid}
        >
          Continue
        </Button>
        {!salaryValid && (
          <div className="text-red-500 text-sm mt-2">Please enter a valid salary to continue.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountrySelector;
