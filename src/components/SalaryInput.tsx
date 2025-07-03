import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Circle, TrendingUp } from 'lucide-react';
import { SalaryData } from '@/pages/Index';
import { useState } from 'react';

interface SalaryInputProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  SGD: 'S$',
  CHF: 'CHF',
  INR: '₹',
  CNY: '¥',
  AED: 'د.إ',
  SAR: '﷼',
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: '.د.ب',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  BRL: 'R$',
  MXN: '$',
  RUB: '₽',
  ZAR: 'R',
  NZD: 'NZ$'
};

const SalaryInput: React.FC<SalaryInputProps> = ({ salaryData, setSalaryData }) => {
  const [error, setError] = useState<string | null>(null);
  const currencySymbol = currencySymbols[salaryData.currency] || salaryData.currency;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSalaryChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    setSalaryData({
      ...salaryData,
      grossSalary: numericValue
    });
    if (numericValue <= 0) {
      setError('Please enter a valid salary greater than 0.');
    } else {
      setError(null);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-green-600 fill-green-600" />
          Salary Information
        </CardTitle>
        <CardDescription>
          Enter your gross annual salary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="salary">Annual Gross Salary</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {currencySymbol}
            </span>
            <Input
              id="salary"
              type="text"
              placeholder="0"
              value={salaryData.grossSalary ? formatNumber(salaryData.grossSalary) : ''}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className={`pl-12 text-lg font-medium ${error ? 'border-red-500' : ''}`}
            />
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={salaryData.currency} onValueChange={(currency) => setSalaryData({ ...salaryData, currency })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                Major Currencies
              </div>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                North America
              </div>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
              
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                Europe
              </div>
              <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
              <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
              <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
              <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
              <SelectItem value="PLN">PLN - Polish Zloty</SelectItem>
              <SelectItem value="CZK">CZK - Czech Koruna</SelectItem>
              <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
              
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                Asia-Pacific
              </div>
              <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
              <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
              <SelectItem value="THB">THB - Thai Baht</SelectItem>
              <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
              <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
              
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                Middle East & Gulf
              </div>
              <SelectItem value="AED">AED - UAE Dirham</SelectItem>
              <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
              <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
              <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
              <SelectItem value="BHD">BHD - Bahraini Dinar</SelectItem>
              
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50">
                Other
              </div>
              <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
              <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {salaryData.grossSalary > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Salary Summary</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Annual Gross:</span>
                <span className="font-medium text-green-800">
                  {currencySymbol}{formatNumber(salaryData.grossSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Monthly Gross:</span>
                <span className="font-medium text-green-800">
                  {currencySymbol}{formatNumber(salaryData.grossSalary / 12)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Enter your gross salary before any deductions. We'll calculate your take-home pay after taxes and other deductions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryInput;
