import React from 'react';

interface TaxSummaryCardProps {
  takeHome: number;
  takeHomeSecondary?: number | undefined;
  effectiveTaxRate: number;
  userBracket?: number;
  viewMode: 'annual' | 'monthly';
  onToggleView: (mode: 'annual' | 'monthly') => void;
  primaryCurrency: string;
  secondaryCurrency?: string | undefined;
}

const TaxSummaryCard: React.FC<TaxSummaryCardProps> = ({ takeHome, takeHomeSecondary, effectiveTaxRate, userBracket, viewMode, onToggleView, primaryCurrency, secondaryCurrency }) => (
  <div className="mb-4">
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-100 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          {viewMode === 'monthly' ? 'Monthly' : 'Annual'} Take-Home: <span className="text-green-700">{primaryCurrency}{(takeHome || 0).toLocaleString()}</span>
          {secondaryCurrency && takeHomeSecondary !== undefined && (
            <span className="ml-2 text-green-600">({secondaryCurrency}{takeHomeSecondary.toLocaleString()})</span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Effective Tax Rate: <span className="font-medium text-blue-700">{effectiveTaxRate.toFixed(1)}%</span>
          {userBracket !== undefined && (
            <span className="ml-4">Tax Bracket: <span className="font-medium text-blue-700">{userBracket.toFixed(1)}%</span></span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded border text-xs font-medium ${viewMode === 'annual' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
          onClick={() => onToggleView('annual')}
        >Annual</button>
        <button
          className={`px-3 py-1 rounded border text-xs font-medium ${viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
          onClick={() => onToggleView('monthly')}
        >Monthly</button>
      </div>
    </div>
  </div>
);

export default TaxSummaryCard; 