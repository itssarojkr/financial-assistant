import TaxCalculatorIndia from './tax/TaxCalculatorIndia';
import TaxCalculatorUS from './tax/TaxCalculatorUS';
import TaxCalculatorCanada from './tax/TaxCalculatorCanada';
import TaxCalculatorUK from './tax/TaxCalculatorUK';
import TaxCalculatorAustralia from './tax/TaxCalculatorAustralia';
import TaxCalculatorGermany from './tax/TaxCalculatorGermany';
import TaxCalculatorFrance from './tax/TaxCalculatorFrance';
import TaxCalculatorBrazil from './tax/TaxCalculatorBrazil';
import TaxCalculatorSouthAfrica from './tax/TaxCalculatorSouthAfrica';
import StrategyBasedTaxCalculator from './tax/StrategyBasedTaxCalculator';
import { SalaryData, TaxData } from '@/pages/Index';
import { convertCurrency } from '@/lib/utils';

interface TaxCalculatorProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  indiaRegime?: 'new' | 'old';
  setIndiaRegime?: (regime: 'new' | 'old') => void;
  usFilingStatus?: 'single' | 'married' | 'head';
  setUsFilingStatus?: (status: 'single' | 'married' | 'head') => void;
  usState?: string;
  setUsState?: (state: string) => void;
  caProvince?: string;
  setCaProvince?: (province: string) => void;
  ukCountry?: string;
  setUkCountry?: (country: string) => void;
  ukStudentLoanPlan?: string;
  setUkStudentLoanPlan?: (plan: string) => void;
  includeSuper?: boolean;
  setIncludeSuper?: (val: boolean) => void;
  churchTaxRate?: number;
  setChurchTaxRate?: (rate: number) => void;
  age?: number;
  setAge?: (age: number) => void;
  grossSalaryCountryCurrency?: number;
  countryCurrency?: string;
  userCurrency?: string;
}

const TaxCalculator = (props: TaxCalculatorProps) => {
  const { salaryData } = props;
  
  console.log('TaxCalculator rendered with country:', salaryData.country, 'countryCode:', salaryData.countryCode);
  
  // Compute the converted salary for tax calculation
  const getDefaultCurrencyForCountry = (countryId: string): string => {
    // Since CountrySelector already sets the correct currency for each country,
    // we can use the current currency as the country's default
    return salaryData.currency;
  };
  const countryCurrency = getDefaultCurrencyForCountry(salaryData.country);
  const grossSalaryCountryCurrency = convertCurrency(salaryData.grossSalary, salaryData.currency, countryCurrency);

  // Create a salaryData object for calculators, always in country currency
  const salaryDataForCalc = {
    ...salaryData,
    grossSalary: grossSalaryCountryCurrency,
    currency: countryCurrency,
  };

  // Pass the converted salary and currency info to calculators
  const calculatorProps = {
    ...props,
    grossSalaryCountryCurrency,
    countryCurrency,
    userCurrency: salaryData.currency,
  };

  // Map country codes to tax calculators
  const countryCodeToCalculator = (countryCode: string) => {
    switch (countryCode) {
      case 'IN': // India
        return (
          <TaxCalculatorIndia
            salaryData={salaryDataForCalc}
            taxData={props.taxData}
            setTaxData={props.setTaxData}
            onNext={props.onNext}
            indiaRegime={props.indiaRegime!}
            setIndiaRegime={props.setIndiaRegime!}
            userCurrency={salaryData.currency}
            countryCurrency={countryCurrency}
          />
        );
      case 'US': // United States
        return (
          <TaxCalculatorUS
            salaryData={salaryDataForCalc}
            taxData={props.taxData}
            setTaxData={props.setTaxData}
            onNext={props.onNext}
            usFilingStatus={props.usFilingStatus!}
            setUsFilingStatus={props.setUsFilingStatus!}
            usState={props.usState!}
            setUsState={props.setUsState!}
          />
        );
      case 'CA': // Canada
      case 'GB': // United Kingdom
      case 'AU': // Australia
      case 'DE': // Germany
      case 'FR': // France
      case 'BR': // Brazil
      case 'ZA': // South Africa
        return (
          <StrategyBasedTaxCalculator
            salaryData={salaryDataForCalc}
            taxData={props.taxData}
            setTaxData={props.setTaxData}
            onNext={props.onNext}
          />
        );
      default:
        console.log('No calculator found for country code:', countryCode);
        return <div className="p-4 text-gray-500">Tax calculation for country code {countryCode} coming soon.</div>;
    }
  };

  return countryCodeToCalculator(salaryData.countryCode);
};

export default TaxCalculator;
