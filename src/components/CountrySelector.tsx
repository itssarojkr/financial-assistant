
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
  { code: 'NL', name: 'Netherlands', currency: 'EUR', states: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant'] },
  { code: 'IN', name: 'India', currency: 'INR', states: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal'] },
  { code: 'CN', name: 'China', currency: 'CNY', states: ['Beijing', 'Shanghai', 'Guangdong', 'Jiangsu', 'Zhejiang', 'Sichuan'] },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', states: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', states: ['Riyadh', 'Makkah', 'Eastern Province', 'Asir', 'Qassim'] }
];

const cityDatabase: { [key: string]: { [key: string]: string[] } } = {
  'United States': {
    'California': ['San Francisco', 'Los Angeles', 'San Diego', 'Sacramento', 'San Jose'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
    'Illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville']
  },
  'Canada': {
    'Ontario': ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Kitchener'],
    'British Columbia': ['Vancouver', 'Victoria', 'Burnaby', 'Richmond', 'Surrey'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil']
  },
  'United Kingdom': {
    'England': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Stirling'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey', 'Bangor']
  },
  'Germany': {
    'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Würzburg', 'Regensburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg'],
    'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg'],
    'Berlin': ['Berlin']
  },
  'India': {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'Delhi': ['New Delhi', 'Delhi', 'Gurgaon', 'Noida', 'Faridabad'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri']
  },
  'China': {
    'Beijing': ['Beijing'],
    'Shanghai': ['Shanghai'],
    'Guangdong': ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan'],
    'Jiangsu': ['Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Nantong'],
    'Zhejiang': ['Hangzhou', 'Ningbo', 'Wenzhou', 'Jiaxing', 'Huzhou'],
    'Sichuan': ['Chengdu', 'Mianyang', 'Deyang', 'Nanchong', 'Yibin']
  },
  'United Arab Emirates': {
    'Dubai': ['Dubai'],
    'Abu Dhabi': ['Abu Dhabi', 'Al Ain'],
    'Sharjah': ['Sharjah'],
    'Ajman': ['Ajman'],
    'Ras Al Khaimah': ['Ras Al Khaimah']
  },
  'Saudi Arabia': {
    'Riyadh': ['Riyadh'],
    'Makkah': ['Jeddah', 'Mecca', 'Taif'],
    'Eastern Province': ['Dammam', 'Dhahran', 'Al Khobar', 'Jubail'],
    'Asir': ['Abha', 'Khamis Mushait'],
    'Qassim': ['Buraydah', 'Unaizah']
  }
};

const CountrySelector: React.FC<CountrySelectorProps> = ({ salaryData, setSalaryData, onNext }) => {
  const selectedCountry = countries.find(c => c.name === salaryData.country);
  const [isFormValid, setIsFormValid] = useState(false);
  const [cityInput, setCityInput] = useState(salaryData.city);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getCitySuggestions = () => {
    if (!salaryData.country || !salaryData.state || !cityInput) return [];
    
    const countryData = cityDatabase[salaryData.country];
    if (!countryData || !countryData[salaryData.state]) return [];
    
    return countryData[salaryData.state].filter(city => 
      city.toLowerCase().includes(cityInput.toLowerCase())
    );
  };

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
      setCityInput('');
    }
    validateForm();
  };

  const handleStateChange = (state: string) => {
    setSalaryData({
      ...salaryData,
      state,
      city: ''
    });
    setCityInput('');
    validateForm();
  };

  const handleCityChange = (city: string) => {
    setCityInput(city);
    setSalaryData({
      ...salaryData,
      city
    });
    setShowSuggestions(false);
    validateForm();
  };

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    setSalaryData({
      ...salaryData,
      city: value
    });
    setShowSuggestions(value.length > 0);
    validateForm();
  };

  const validateForm = () => {
    const isValid = salaryData.country && salaryData.state && cityInput.trim();
    setIsFormValid(!!isValid);
  };

  const suggestions = getCitySuggestions();

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
          <div className="space-y-2 relative">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter your city"
              value={cityInput}
              onChange={(e) => handleCityInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(cityInput.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
                {suggestions.map((city, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleCityChange(city)}
                  >
                    {city}
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
