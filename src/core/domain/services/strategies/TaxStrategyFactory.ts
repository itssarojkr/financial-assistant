import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { USATaxStrategy } from './USATaxStrategy';
import { CanadaTaxStrategy } from './CanadaTaxStrategy';
import { UKTaxStrategy } from './UKTaxStrategy';
import { AustraliaTaxStrategy } from './AustraliaTaxStrategy';
import { GermanyTaxStrategy } from './GermanyTaxStrategy';
import { FranceTaxStrategy } from './FranceTaxStrategy';
import { BrazilTaxStrategy } from './BrazilTaxStrategy';
import { SouthAfricaTaxStrategy } from './SouthAfricaTaxStrategy';
import { IndiaTaxStrategy } from './IndiaTaxStrategy';

/**
 * Factory for creating tax calculation strategies
 * 
 * This factory provides a centralized way to create and manage
 * tax calculation strategies for different countries.
 */
export class TaxStrategyFactory {
  private static instance: TaxStrategyFactory;
  private strategies: Map<string, TaxCalculationStrategy> = new Map();

  private constructor() {
    this.initializeStrategies();
  }

  /**
   * Gets the singleton instance of TaxStrategyFactory
   */
  public static getInstance(): TaxStrategyFactory {
    if (!TaxStrategyFactory.instance) {
      TaxStrategyFactory.instance = new TaxStrategyFactory();
    }
    return TaxStrategyFactory.instance;
  }

  /**
   * Gets a tax strategy for a specific country
   */
  public getStrategy(countryCode: string): TaxCalculationStrategy | null {
    return this.strategies.get(countryCode.toUpperCase()) || null;
  }

  /**
   * Gets all available country codes
   */
  public getAvailableCountries(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Gets all available strategies
   */
  public getAllStrategies(): TaxCalculationStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Checks if a strategy exists for a country
   */
  public hasStrategy(countryCode: string): boolean {
    return this.strategies.has(countryCode.toUpperCase());
  }

  /**
   * Registers a new strategy
   */
  public registerStrategy(strategy: TaxCalculationStrategy): void {
    this.strategies.set(strategy.getCountryCode().toUpperCase(), strategy);
  }

  /**
   * Removes a strategy
   */
  public removeStrategy(countryCode: string): boolean {
    return this.strategies.delete(countryCode.toUpperCase());
  }

  /**
   * Gets strategy information for all countries
   */
  public getStrategyInfo(): Array<{
    countryCode: string;
    countryName: string;
    description: string;
  }> {
    return Array.from(this.strategies.values()).map(strategy => ({
      countryCode: strategy.getCountryCode(),
      countryName: strategy.getCountryName(),
      description: `Tax calculation for ${strategy.getCountryName()}`,
    }));
  }

  /**
   * Initializes default strategies
   */
  private initializeStrategies(): void {
    // Register all country strategies
    this.registerStrategy(new USATaxStrategy());
    this.registerStrategy(new CanadaTaxStrategy());
    this.registerStrategy(new UKTaxStrategy());
    this.registerStrategy(new AustraliaTaxStrategy());
    this.registerStrategy(new GermanyTaxStrategy());
    this.registerStrategy(new FranceTaxStrategy());
    this.registerStrategy(new BrazilTaxStrategy());
    this.registerStrategy(new SouthAfricaTaxStrategy());
    this.registerStrategy(new IndiaTaxStrategy());
  }
} 