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
  // North America
  { code: 'US', name: 'United States', currency: 'USD', region: 'North America', states: ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'] },
  { code: 'CA', name: 'Canada', currency: 'CAD', region: 'North America', states: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan'] },
  { code: 'MX', name: 'Mexico', currency: 'MXN', region: 'North America', states: ['Mexico City', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Veracruz'] },

  // Europe
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', region: 'Europe', states: ['England', 'Scotland', 'Wales', 'Northern Ireland'] },
  { code: 'DE', name: 'Germany', currency: 'EUR', region: 'Europe', states: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Berlin', 'Hamburg', 'Hesse'] },
  { code: 'FR', name: 'France', currency: 'EUR', region: 'Europe', states: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine', 'Occitanie', 'Auvergne-Rhône-Alpes'] },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', region: 'Europe', states: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant', 'Gelderland'] },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', region: 'Europe', states: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Vaud', 'Aargau'] },
  { code: 'ES', name: 'Spain', currency: 'EUR', region: 'Europe', states: ['Madrid', 'Catalonia', 'Andalusia', 'Valencia', 'Basque Country', 'Galicia'] },
  { code: 'IT', name: 'Italy', currency: 'EUR', region: 'Europe', states: ['Lombardy', 'Lazio', 'Veneto', 'Tuscany', 'Piedmont', 'Emilia-Romagna'] },
  { code: 'SE', name: 'Sweden', currency: 'SEK', region: 'Europe', states: ['Stockholm', 'Västra Götaland', 'Skåne', 'Uppsala', 'Värmland'] },
  { code: 'NO', name: 'Norway', currency: 'NOK', region: 'Europe', states: ['Oslo', 'Viken', 'Rogaland', 'Møre og Romsdal', 'Nordland'] },
  { code: 'DK', name: 'Denmark', currency: 'DKK', region: 'Europe', states: ['Capital Region', 'Zealand', 'Central Jutland', 'North Jutland', 'Southern Denmark'] },
  { code: 'PL', name: 'Poland', currency: 'PLN', region: 'Europe', states: ['Mazowieckie', 'Śląskie', 'Wielkopolskie', 'Małopolskie', 'Dolnośląskie'] },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', region: 'Europe', states: ['Prague', 'Central Bohemia', 'South Moravia', 'North Moravia', 'Plzen'] },

  // Asia-Pacific
  { code: 'IN', name: 'India', currency: 'INR', region: 'Asia-Pacific', states: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Telangana', 'Haryana'] },
  { code: 'CN', name: 'China', currency: 'CNY', region: 'Asia-Pacific', states: ['Beijing', 'Shanghai', 'Guangdong', 'Jiangsu', 'Zhejiang', 'Sichuan', 'Shandong'] },
  { code: 'JP', name: 'Japan', currency: 'JPY', region: 'Asia-Pacific', states: ['Tokyo', 'Osaka', 'Kanagawa', 'Aichi', 'Saitama', 'Chiba'] },
  { code: 'SG', name: 'Singapore', currency: 'SGD', region: 'Asia-Pacific', states: ['Central Singapore', 'East Singapore', 'North Singapore', 'Northeast Singapore', 'West Singapore'] },
  { code: 'KR', name: 'South Korea', currency: 'KRW', region: 'Asia-Pacific', states: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'] },
  { code: 'TH', name: 'Thailand', currency: 'THB', region: 'Asia-Pacific', states: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Chiang Rai', 'Krabi'] },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', region: 'Asia-Pacific', states: ['Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Sabah', 'Sarawak'] },
  { code: 'PH', name: 'Philippines', currency: 'PHP', region: 'Asia-Pacific', states: ['Metro Manila', 'Cebu', 'Davao', 'Iloilo', 'Cagayan de Oro', 'Bacolod'] },
  { code: 'AU', name: 'Australia', currency: 'AUD', region: 'Asia-Pacific', states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'] },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', region: 'Asia-Pacific', states: ['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty'] },

  // Middle East & Gulf
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', region: 'Middle East & Gulf', states: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'] },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', region: 'Middle East & Gulf', states: ['Riyadh', 'Makkah', 'Eastern Province', 'Asir', 'Qassim', 'Tabuk'] },
  { code: 'QA', name: 'Qatar', currency: 'QAR', region: 'Middle East & Gulf', states: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Shamal'] },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', region: 'Middle East & Gulf', states: ['Capital', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi'] },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', region: 'Middle East & Gulf', states: ['Capital', 'Muharraq', 'Northern', 'Southern'] },

  // Latin America
  { code: 'BR', name: 'Brazil', currency: 'BRL', region: 'Latin America', states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul'] },

  // Africa
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', region: 'Africa', states: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo'] },

  // Other
  { code: 'RU', name: 'Russia', currency: 'RUB', region: 'Europe', states: ['Moscow', 'St. Petersburg', 'Moscow Oblast', 'Krasnodar Krai', 'Sverdlovsk Oblast'] }
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
  },
  'Singapore': {
    'Central Singapore': ['Singapore City', 'Marina Bay', 'Chinatown'],
    'East Singapore': ['Bedok', 'Tampines', 'Pasir Ris'],
    'North Singapore': ['Woodlands', 'Yishun', 'Sembawang']
  },
  'South Korea': {
    'Seoul': ['Seoul', 'Gangnam', 'Hongdae', 'Itaewon'],
    'Busan': ['Busan', 'Haeundae', 'Seomyeon'],
    'Incheon': ['Incheon', 'Songdo']
  },
  'Japan': {
    'Tokyo': ['Tokyo', 'Shibuya', 'Shinjuku', 'Ginza'],
    'Osaka': ['Osaka', 'Namba', 'Umeda'],
    'Kanagawa': ['Yokohama', 'Kawasaki']
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

  // Group countries by region
  const groupedCountries = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as { [key: string]: typeof countries });

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
