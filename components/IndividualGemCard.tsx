import React, { useMemo, useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { IndividualGemAnalysisResult } from '../types';

type SortKey = 'name' | 'expectedProfit' | 'avgTransfiguredValue' | 'outcomeCount';

const TOP_RESULTS = 20;

const formatChaos = (value: number): string => `${value.toFixed(2)} c`;

const formatTooltip = (entries: IndividualGemAnalysisResult['priciestGems']): string => (
  `Most Valuable Outcomes:\n${entries.map((entry) => `${entry.name} (${entry.chaosValue.toFixed(1)} c)`).join('\n')}`
);

const SortIcon: React.FC<{ active: boolean; direction: 'asc' | 'desc' }> = ({ active, direction }) => {
  if (!active) return <span className="text-gray-500">↕</span>;
  return <span className="text-cyan-300">{direction === 'asc' ? '↑' : '↓'}</span>;
};

export const IndividualGemCard: React.FC<{ data: IndividualGemAnalysisResult[] }> = ({ data }) => {
  const [showAll, setShowAll] = useState(false);
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

  const visibleData = showAll ? sortedData : sortedData.slice(0, TOP_RESULTS);

  const requestSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const headers: Array<{ key: SortKey; label: string; className?: string }> = [
    { key: 'name', label: 'Base Gem Name' },
    { key: 'expectedProfit', label: 'Expected Profit (c)', className: 'text-right' },
    { key: 'avgTransfiguredValue', label: 'Expected Value (c)', className: 'text-right' },
    { key: 'outcomeCount', label: 'Outcomes', className: 'text-right' },
  ];

  return (
    <DashboardCard title="Analysis B (1/0): Random Transfigured Version (by Base Gem)">
      <p className="mb-2 text-sm text-gray-400">
        Analyzes the profit from using "Transform a non-Transfigured Skill Gem to be a random Transfigured version".
      </p>
      <p className="mb-4 text-xs text-gray-500">
        Normal skill gems are available from Lilly, so this analysis treats the input cost as 0 c.
        Hover over an expected value to see the five most valuable possible outcomes.
      </p>
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
            {visibleData.map((gem) => {
              const valueTooltip = gem.priciestGems.length > 0 ? formatTooltip(gem.priciestGems) : undefined;
              return (
                <tr key={gem.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/40">
                  <th scope="row" className="flex items-center gap-3 whitespace-nowrap px-4 py-3 font-medium text-white">
                    {gem.icon && <img src={gem.icon} alt="" className="h-8 w-8" />}
                    {gem.name}
                  </th>
                  <td className="px-4 py-3 text-right font-bold text-green-400">{formatChaos(gem.expectedProfit)}</td>
                  <td className="px-4 py-3 text-right">
                    <span title={valueTooltip} className={valueTooltip ? 'cursor-help border-b border-dotted border-gray-500' : undefined}>
                      {formatChaos(gem.avgTransfiguredValue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{gem.outcomeCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length > TOP_RESULTS && (
        <div className="mt-4 flex items-center justify-between gap-4 text-xs text-gray-500">
          <span>{showAll ? `Showing all ${data.length} eligible base gems` : `Showing the top ${TOP_RESULTS} of ${data.length} eligible base gems`}</span>
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="rounded border border-gray-600 px-3 py-1 text-gray-300 hover:border-cyan-400 hover:text-cyan-300"
          >
            {showAll ? 'Show top 20' : 'Show all'}
          </button>
        </div>
      )}
    </DashboardCard>
  );
};
