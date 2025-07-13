import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

// Countries with implemented tax calculators
const SUPPORTED_COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Brazil',
  'South Africa'
];

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

interface State {
  id: number;
  name: string;
  country_id: number;
}

interface City {
  id: number;
  name: string;
  state_id: number;
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

interface CountrySelectorProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
  onNext: () => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ salaryData, setSalaryData, onNext }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching countries:', error);
      } else {
        // Filter to only show countries with implemented tax calculators
        const supportedCountries = (data || []).filter(country => 
          SUPPORTED_COUNTRIES.includes(country.name)
        );
        setCountries(supportedCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .eq('country_id', countryId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching states:', error);
      } else {
        setStates(data || []);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (stateId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('state_id', stateId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching cities:', error);
      } else {
        setCities(data || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalities = async (cityId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .eq('city_id', cityId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching localities:', error);
      } else {
        setLocalities(data || []);
      }
    } catch (error) {
      console.error('Error fetching localities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalityChange = (localityId: string) => {
    const locality = localities.find(l => l.id.toString() === localityId);
    if (locality) {
      setSalaryData({
        ...salaryData,
        locality: locality.name,
        localityId: locality.id.toString(),
      });
    }
  };

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c.id.toString() === countryId);
    if (country) {
      setSalaryData({
        ...salaryData,
        country: country.name,
        countryCode: country.code,
        currency: country.currency,
        state: '',
        stateId: '',
        city: '',
        cityId: '',
        locality: '',
        localityId: '',
      });
      fetchStates(parseInt(countryId));
    }
  };

  const handleStateChange = (stateId: string) => {
    const state = states.find(s => s.id.toString() === stateId);
    if (state) {
      setSalaryData({
        ...salaryData,
        state: state.name,
        stateId: state.id.toString(),
        city: '',
        cityId: '',
        locality: '',
        localityId: '',
      });
      fetchCities(parseInt(stateId));
    }
  };

  const handleCityChange = (cityId: string) => {
    const city = cities.find(c => c.id.toString() === cityId);
    if (city) {
      setSalaryData({
        ...salaryData,
        city: city.name,
        cityId: city.id.toString(),
        locality: '',
        localityId: '',
      });
      fetchLocalities(parseInt(cityId));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Only countries with implemented tax calculators are shown
        </p>
        <Select onValueChange={handleCountryChange}>
          <SelectTrigger id="country">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.id} value={country.id.toString()}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {salaryData.country && (
        <>
          <div>
            <Label htmlFor="state">State</Label>
            <Select onValueChange={handleStateChange}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {salaryData.state && (
            <div>
              <Label htmlFor="city">City</Label>
              <Select onValueChange={handleCityChange}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {salaryData.city && (
            <div>
              <Label htmlFor="locality">Locality</Label>
              <Select onValueChange={handleLocalityChange}>
                <SelectTrigger id="locality">
                  <SelectValue placeholder="Select a locality" />
                </SelectTrigger>
                <SelectContent>
                  {localities.map(locality => (
                    <SelectItem key={locality.id} value={locality.id.toString()}>
                      {locality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <Button onClick={onNext}>Next</Button>
    </div>
  );
};

export default CountrySelector;
