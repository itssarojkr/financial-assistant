// Strategy interface
export type { TaxCalculationStrategy } from '../TaxCalculationStrategy';

// Country-specific strategies
export { USATaxStrategy } from './USATaxStrategy';
export { CanadaTaxStrategy } from './CanadaTaxStrategy';
export { UKTaxStrategy } from './UKTaxStrategy';
export { AustraliaTaxStrategy } from './AustraliaTaxStrategy';
export { GermanyTaxStrategy } from './GermanyTaxStrategy';
export { FranceTaxStrategy } from './FranceTaxStrategy';
export { BrazilTaxStrategy } from './BrazilTaxStrategy';
export { SouthAfricaTaxStrategy } from './SouthAfricaTaxStrategy';
export { IndiaTaxStrategy } from './IndiaTaxStrategy';

// Strategy factory
export { TaxStrategyFactory } from './TaxStrategyFactory'; 