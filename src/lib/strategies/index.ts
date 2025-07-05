// Export all tax strategies
export { IndiaTaxStrategy } from './india-tax-strategy';
export { USTaxStrategy } from './us-tax-strategy';
export { UKTaxStrategy } from './uk-tax-strategy';
export { CanadaTaxStrategy } from './canada-tax-strategy';
export { AustraliaTaxStrategy } from './australia-tax-strategy';
export { GermanyTaxStrategy } from './germany-tax-strategy';
export { FranceTaxStrategy } from './france-tax-strategy';
export { BrazilTaxStrategy } from './brazil-tax-strategy';
export { SouthAfricaTaxStrategy } from './south-africa-tax-strategy';

// Import the registry
import { TaxStrategyRegistry } from '../tax-strategy';
import { IndiaTaxStrategy } from './india-tax-strategy';
import { USTaxStrategy } from './us-tax-strategy';
import { UKTaxStrategy } from './uk-tax-strategy';
import { CanadaTaxStrategy } from './canada-tax-strategy';
import { AustraliaTaxStrategy } from './australia-tax-strategy';
import { GermanyTaxStrategy } from './germany-tax-strategy';
import { FranceTaxStrategy } from './france-tax-strategy';
import { BrazilTaxStrategy } from './brazil-tax-strategy';
import { SouthAfricaTaxStrategy } from './south-africa-tax-strategy';

// Register all strategies
export function registerAllStrategies(): void {
  console.log('Registering tax strategies...');
  TaxStrategyRegistry.register(new IndiaTaxStrategy());
  console.log('India strategy registered');
  TaxStrategyRegistry.register(new USTaxStrategy());
  console.log('US strategy registered');
  TaxStrategyRegistry.register(new UKTaxStrategy());
  console.log('UK strategy registered');
  TaxStrategyRegistry.register(new CanadaTaxStrategy());
  console.log('Canada strategy registered');
  TaxStrategyRegistry.register(new AustraliaTaxStrategy());
  console.log('Australia strategy registered');
  TaxStrategyRegistry.register(new GermanyTaxStrategy());
  console.log('Germany strategy registered');
  TaxStrategyRegistry.register(new FranceTaxStrategy());
  console.log('France strategy registered');
  TaxStrategyRegistry.register(new BrazilTaxStrategy());
  console.log('Brazil strategy registered');
  TaxStrategyRegistry.register(new SouthAfricaTaxStrategy());
  console.log('South Africa strategy registered');
  
  // TODO: Add other country strategies as they are implemented
  // TaxStrategyRegistry.register(new GermanyTaxStrategy());
  // TaxStrategyRegistry.register(new FranceTaxStrategy());
  // TaxStrategyRegistry.register(new BrazilTaxStrategy());
  // TaxStrategyRegistry.register(new SouthAfricaTaxStrategy());
  
  console.log('All strategies registered. Available countries:', TaxStrategyRegistry.getSupportedCountries());
}

// Auto-register strategies when this module is imported
registerAllStrategies();

// Export registry and factory
export { TaxStrategyRegistry, TaxStrategyFactory } from '../tax-strategy';
export type { 
  TaxCalculationStrategy, 
  TaxCalculationParams, 
  TaxCalculationResult,
  TaxBracketConfig,
  DeductionConfig,
  AdditionalTaxConfig,
  ValidationResult
} from '../tax-strategy'; 