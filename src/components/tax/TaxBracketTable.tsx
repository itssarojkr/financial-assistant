import React from 'react';

interface Bracket {
  min: number;
  max: number | null;
  rate: number;
  taxPaid: number;
}

interface TaxBracketTableProps {
  brackets: Bracket[];
  taxableIncome: number;
  viewMode: 'annual' | 'monthly';
  currencySymbol: string;
  secondaryCurrency?: string | undefined;
  userBracketIdx: number;
  getValue: (val: number) => number;
  getValueSecondary?: ((val: number) => number) | undefined;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(Math.round(num));
const formatBracketRange = (min: number, max: number | null, currency: string) => {
  if (max === null) return `${currency}${formatNumber(min)}+`;
  return `${currency}${formatNumber(min)} - ${currency}${formatNumber(max)}`;
};

const TaxBracketTable: React.FC<TaxBracketTableProps> = ({ brackets, taxableIncome, viewMode, currencySymbol, secondaryCurrency, userBracketIdx, getValue, getValueSecondary }) => (
  <div className="mt-8">
    <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
      <table className="min-w-full text-sm border rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left font-semibold">Bracket Range</th>
            <th className="px-4 py-2 text-left font-semibold">Rate</th>
            <th className="px-4 py-2 text-left font-semibold">Income Taxed</th>
            <th className="px-4 py-2 text-left font-semibold">Tax Paid</th>
          </tr>
        </thead>
        <tbody>
          {brackets.map((bracket, idx) => {
            const isUserBracket = idx === userBracketIdx;
            const incomeTaxed = bracket.max === null
              ? Math.max(0, taxableIncome - bracket.min)
              : Math.max(0, Math.min(taxableIncome, bracket.max) - bracket.min);
            return (
              <tr
                key={idx + '-' + userBracketIdx}
                className={
                  (isUserBracket
                    ? 'bg-blue-50 font-semibold text-blue-900'
                    : idx % 2 === 0
                    ? 'bg-white'
                    : 'bg-gray-50') +
                  ' transition-all duration-500 ease-in-out transform'
                }
                style={{
                  opacity: 1,
                  transition: 'opacity 0.5s, background 0.5s, color 0.5s, transform 0.5s',
                  transform: isUserBracket ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
                }}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  {formatBracketRange(bracket.min, bracket.max, currencySymbol)}
                  {secondaryCurrency && getValueSecondary && (
                    <span className="ml-2 text-green-700">
                      ({formatBracketRange(getValueSecondary(bracket.min), getValueSecondary(bracket.max ?? 0), secondaryCurrency)})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{(bracket.rate * 100).toFixed(1)}%</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {currencySymbol}{formatNumber(getValue(incomeTaxed))}
                  {secondaryCurrency && getValueSecondary && (
                    <span className="ml-2 text-green-700">
                      ({secondaryCurrency}{formatNumber(getValueSecondary(incomeTaxed))})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {currencySymbol}{formatNumber(getValue(bracket.taxPaid))}
                  {secondaryCurrency && getValueSecondary && (
                    <span className="ml-2 text-green-700">
                      ({secondaryCurrency}{formatNumber(getValueSecondary(bracket.taxPaid))})
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-xs text-gray-500 mt-2">
        Highlighted row shows the bracket you fall into based on your taxable income.
      </div>
    </div>
  </div>
);

export default TaxBracketTable; 