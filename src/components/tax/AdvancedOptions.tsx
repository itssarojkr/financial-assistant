import React from 'react';

export interface DeductionField {
  key: string;
  label: string;
  maxValue?: number;
  placeholder?: string;
  tooltip?: string;
}

interface AdvancedOptionsProps {
  isVisible: boolean;
  onToggle: () => void;
  deductions: Record<string, number>;
  onUpdateDeduction: (key: string, value: number) => void;
  fields: DeductionField[];
  description?: string;
  className?: string;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  isVisible,
  onToggle,
  deductions,
  onUpdateDeduction,
  fields,
  description = "Deductions reduce your taxable income before tax calculation.",
  className = ""
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <button
        className="text-blue-600 underline text-sm focus:outline-none hover:text-blue-800 transition-colors"
        onClick={onToggle}
        type="button"
      >
        {isVisible ? 'Hide advanced options' : 'Show advanced options'}
      </button>
      
      {isVisible && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <label key={field.key} className="flex-1">
                <span className="block text-xs text-gray-600 mb-1">
                  {field.label}
                  {field.tooltip && (
                    <span title={field.tooltip} className="ml-1 cursor-help">🛈</span>
                  )}
                </span>
                <input
                  type="number"
                  min={0}
                  max={field.maxValue}
                  placeholder={field.placeholder}
                  value={deductions[field.key] || 0}
                  onChange={(e) => onUpdateDeduction(field.key, Number(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions; 