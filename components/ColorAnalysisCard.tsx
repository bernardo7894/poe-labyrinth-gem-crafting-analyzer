import React, { useMemo, useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ColorAnalysisResult } from '../types';

type SortKey = 'color' | 'expectedProfit' | 'expectedValue' | 'inputCost' | 'gemCount';

interface ColorAnalysisCardProps {
  title: string;
  description: string;
  data: ColorAnalysisResult[];
}

const formatChaos = (value: number): string => `${value.toFixed(2)} c`;

const formatTooltip = (label: string, entries: ColorAnalysisResult['cheapestGems']): string => (
  `${label}:\n${entries.map((entry) => `${entry.name} (${entry.chaosValue.toFixed(1)} c)`).join('\n')}`
);

const SortIcon: React.FC<{ active: boolean; direction: 'asc' | 'desc' }> = ({ active, direction }) => {
  if (!active) return <span className="text-gray-500">↕</span>;
  return <span className="text-cyan-300">{direction === 'asc' ? '↑' : '↓'}</span>;
};

export const ColorAnalysisCard: React.FC<ColorAnalysisCardProps> = ({ title, description, data }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'expectedProfit',
    direction: 'desc',
  });

  const sortedData = useMemo(() => [...data].sort((left, right) => {
    const leftValue = left[sortConfig.key];
    const rightValue = right[sortConfig.key];
    const comparison = typeof leftValue === 'string' && typeof rightValue === 'string'
      ? leftValue.localeCompare(rightValue)
      : Number(leftValue) - Number(rightValue);
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  }), [data, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const headers: Array<{ key: SortKey; label: string; className?: string }> = [
    { key: 'color', label: 'Color' },
    { key: 'expectedProfit', label: 'Expected Profit (c)', className: 'text-right' },
    { key: 'expectedValue', label: 'Expected Value (c)', className: 'text-right' },
    { key: 'inputCost', label: 'Input Cost (c)', className: 'text-right' },
    { key: 'gemCount', label: 'Pool Size', className: 'text-right' },
  ];

  return (
    <DashboardCard title={title}>
      <p className="mb-4 text-sm text-gray-400">{description}</p>
      {data.length === 0 ? (
        <p className="rounded-lg border border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
          No data available for this analysis.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700/60 text-xs uppercase text-cyan-300">
              <tr>
                {headers.map((header) => (
                  <th key={header.key} scope="col" className={`px-4 py-3 ${header.className ?? ''}`}>
                    <button
                      type="button"
                      onClick={() => requestSort(header.key)}
                      className={`flex w-full items-center gap-2 ${header.className?.includes('text-right') ? 'justify-end' : 'justify-start'}`}
                    >
                      {header.label}
                      <SortIcon active={sortConfig.key === header.key} direction={sortConfig.direction} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((result) => {
                const profitClass = result.expectedProfit >= 0 ? 'text-green-400' : 'text-red-400';
                const valueTooltip = result.priciestGems.length > 0
                  ? formatTooltip('Most Valuable Outcomes', result.priciestGems)
                  : undefined;
                const costTooltip = result.cheapestGems.length > 0
                  ? formatTooltip('Cheapest Inputs', result.cheapestGems)
                  : undefined;

                return (
                  <tr key={result.color} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/40">
                    <th scope="row" className="px-4 py-3 font-semibold text-white">{result.color}</th>
                    <td className={`px-4 py-3 text-right font-bold ${profitClass}`}>{formatChaos(result.expectedProfit)}</td>
                    <td className="px-4 py-3 text-right">
                      <span title={valueTooltip} className={valueTooltip ? 'cursor-help border-b border-dotted border-gray-500' : undefined}>
                        {formatChaos(result.expectedValue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span title={costTooltip} className={costTooltip ? 'cursor-help border-b border-dotted border-gray-500' : undefined}>
                        {formatChaos(result.inputCost)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{result.gemCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
};
