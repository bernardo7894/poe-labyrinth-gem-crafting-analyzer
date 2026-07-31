
import React, { useState, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import { IndividualGemAnalysisResult } from '../types';

const SortIcon: React.FC<{ direction?: 'asc' | 'desc' }> = ({ direction }) => {
  if (!direction) {
    return <span className="text-gray-600">↕</span>;
  }
  return direction === 'asc' ? <span className="text-cyan-400">↑</span> : <span className="text-cyan-400">↓</span>;
};

const GemTable: React.FC<{ data: IndividualGemAnalysisResult[] }> = ({ data }) => {
  type SortKeys = keyof IndividualGemAnalysisResult;
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({
    key: 'expectedProfit',
    direction: 'desc',
  });

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    sortableItems.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: SortKeys) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const headers: { key: SortKeys; label: string; className?: string }[] = [
    { key: 'name', label: 'Gem Name', className: 'w-2/5' },
    { key: 'inputCost', label: 'Input Cost', className: 'w-1/5 text-right' },
    { key: 'avgTransfiguredValue', label: 'Avg. Outcome', className: 'w-1/5 text-right' },
    { key: 'expectedProfit', label: 'Expected Profit', className: 'w-1/5 text-right' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-cyan-400 uppercase bg-gray-700/50">
          <tr>
            {headers.map(({ key, label, className }) => (
              <th key={key} scope="col" className={`px-4 py-3 ${className || ''}`}>
                <button onClick={() => requestSort(key)} className="flex items-center w-full justify-between">
                  {label}
                  <SortIcon direction={sortConfig.key === key ? sortConfig.direction : undefined} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((gem) => {
            const profitColor = gem.expectedProfit > 0 ? 'text-green-400' : gem.expectedProfit < 0 ? 'text-red-400' : 'text-gray-400';
            return (
              <tr key={gem.id} className="border-b border-gray-700 hover:bg-gray-700/40">
                <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap flex items-center">
                   <img src={gem.icon} alt={gem.name} className="w-8 h-8 mr-3" />
                   {gem.name}
                </th>
                <td className="px-4 py-3 text-right">{gem.inputCost.toFixed(2)} c</td>
                <td className="px-4 py-3 text-right">{gem.avgTransfiguredValue.toFixed(2)} c</td>
                <td className={`px-4 py-3 font-bold text-right ${profitColor}`}>{gem.expectedProfit.toFixed(2)} c</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


export const IndividualGemCard: React.FC<{ data: IndividualGemAnalysisResult[] }> = ({ data }) => {
  return (
    <DashboardCard title="Best Gems for Specific Transfigure">
        <p className="text-sm text-gray-400 mb-4">
          Analyzes the profit from using "Transform a non-Transfigured Skill Gem to be a random Transfigured version".
        </p>
        <GemTable data={data} />
    </DashboardCard>
  );
};
