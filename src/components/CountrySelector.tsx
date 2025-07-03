
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, User } from 'lucide-react';
import { SalaryData } from '@/pages/Index';

interface CountrySelectorProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
  onNext: () => void;
}

const countries = [
  { code: 'US', name: 'United States', currency: 'USD', states: ['California', 'New York', 'Texas', 'Florida', 'Illinois'] },
  { code: 'CA', name: 'Canada', currency: 'CAD', states: ['Ontario', 'British Columbia', 'Alberta', 'Quebec'] },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', states: ['England', 'Scotland', 'Wales', 'Northern Ireland'] },
  { code: 'DE', name: 'Germany', currency: 'EUR', states: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Berlin'] },
  { code: 'FR', name: 'France', currency: 'EUR', states: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine'] },
  { code: 'AU', name: 'Australia', currency: 'AUD', states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'] },
  { code: 'JP', name: 'Japan', currency: 'JPY', states: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'] },
  { code: 'SG', name: 'Singapore', currency: 'SGD', states: ['Central Singapore', 'East Singapore', 'North Singapore'] },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', states: ['Zurich', 'Geneva', 'Basel', 'Bern'] },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', states: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant'] }
];

const CountrySelector: React.FC<CountrySelectorProps> = ({ salaryData, setSalaryData, onNext }) => {
  const selectedCountry = countries.find(c => c.name === salaryData.country);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setSalaryData({
        ...salaryData,
        country: countryName,
        currency: country.currency,
        state: '',
        city: ''
      });
    }
    validateForm();
  };

  const handleStateChange = (state: string) => {
    setSalaryData({
      ...salaryData,
      state,
      city: ''
    });
    validateForm();
  };

  const handleCityChange = (city: string) => {
    setSalaryData({
      ...salaryData,
      city
    });
    validateForm();
  };

  const validateForm = () => {
    const isValid = salaryData.country && salaryData.state && salaryData.city;
    setIsFormValid(!!isValid);
  };

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
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCountry && (
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Select value={salaryData.state} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a state/province" />
              </SelectTrigger>
              <SelectContent>
                {selectedCountry.states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {salaryData.state && (
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter your city"
              value={salaryData.city}
              onChange={(e) => handleCityChange(e.target.value)}
            />
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
          onClick={onNext} 
          className="w-full" 
          disabled={!isFormValid}
        >
          Continue to Salary Input
        </Button>
      </CardContent>
    </Card>
  );
};

export default CountrySelector;
