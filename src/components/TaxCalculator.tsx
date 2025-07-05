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
}

const TaxCalculator = (props: TaxCalculatorProps) => {
  const { salaryData } = props;
  
  console.log('TaxCalculator rendered with country:', salaryData.country);
  
  // Use StrategyBasedTaxCalculator for countries with strategy implementations
  switch (salaryData.country) {
    case 'India':
      console.log('Using original TaxCalculatorIndia');
      return <TaxCalculatorIndia {...props} />;
    case 'United States':
      console.log('Using original TaxCalculatorUS');
      return <TaxCalculatorUS {...props} />;
    case 'Canada':
      console.log('Using StrategyBasedTaxCalculator for Canada');
      return <StrategyBasedTaxCalculator {...props} countryCode="CA" />;
    case 'United Kingdom':
    case 'UK':
      console.log('Using StrategyBasedTaxCalculator for UK');
      return <StrategyBasedTaxCalculator {...props} countryCode="UK" />;
    case 'Australia':
      console.log('Using StrategyBasedTaxCalculator for Australia');
      return <StrategyBasedTaxCalculator {...props} countryCode="AU" />;
    case 'Germany':
      console.log('Using StrategyBasedTaxCalculator for Germany');
      return <StrategyBasedTaxCalculator {...props} countryCode="DE" />;
    case 'France':
      console.log('Using StrategyBasedTaxCalculator for France');
      return <StrategyBasedTaxCalculator {...props} countryCode="FR" />;
    case 'Brazil':
      console.log('Using StrategyBasedTaxCalculator for Brazil');
      return <StrategyBasedTaxCalculator {...props} countryCode="BR" />;
    case 'South Africa':
      console.log('Using StrategyBasedTaxCalculator for South Africa');
      return <StrategyBasedTaxCalculator {...props} countryCode="ZA" />;
    default:
      console.log('No calculator found for country:', salaryData.country);
      return <div className="p-4 text-gray-500">Tax calculation for {salaryData.country} coming soon.</div>;
  }
};

export default TaxCalculator;
