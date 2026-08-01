import React, { useMemo, useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ColorAnalysisResult } from '../types';

type SortKey = 'color' | 'expectedProfit' | 'expectedValue' | 'inputCost' | 'gemCount';

interface ColorAnalysisCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  data: ColorAnalysisResult[];
}

const formatChaos = (value: number): string => `${value.toFixed(2)} c`;

const formatTooltip = (label: string, entries: ColorAnalysisResult['cheapestGems']): string => (
  `${label}:\n${entries.map((entry) => `${entry.name} (${entry.chaosValue.toFixed(1)} c)`).join('\n')}`
);

const SortIcon: React.FC<{ active: boolean; direction: 'asc' | 'desc' }> = ({ active, direction }) => {
  if (!active) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon sort-icon--active">{direction === 'asc' ? '↑' : '↓'}</span>;
};

export const ColorAnalysisCard: React.FC<ColorAnalysisCardProps> = ({ eyebrow, title, description, data }) => {
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
    { key: 'color', label: 'Outcome colour' },
    { key: 'expectedProfit', label: 'Expected profit', className: 'table-number' },
    { key: 'expectedValue', label: 'Expected value', className: 'table-number' },
    { key: 'inputCost', label: 'Input cost', className: 'table-number' },
    { key: 'gemCount', label: 'Pool', className: 'table-number' },
  ];

  return (
    <DashboardCard eyebrow={eyebrow} title={title} className="analysis-card">
      <p className="card-description">{description}</p>
      {data.length === 0 ? (
        <p className="empty-state">
          No data available for this analysis.
        </p>
      ) : (
        <div className="table-frame">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header.key} scope="col" className={header.className ?? ''}>
                    <button
                      type="button"
                      onClick={() => requestSort(header.key)}
                      className={header.className === 'table-number' ? 'table-sort table-sort--right' : 'table-sort'}
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
                const profitClass = result.expectedProfit >= 0 ? 'profit-value--positive' : 'profit-value--negative';
                const valueTooltip = result.priciestGems.length > 0
                  ? formatTooltip('Most Valuable Outcomes', result.priciestGems)
                  : undefined;
                const costTooltip = result.cheapestGems.length > 0
                  ? formatTooltip('Cheapest Inputs', result.cheapestGems)
                  : undefined;
                const colorClass = `gem-color-dot--${result.color.toLowerCase()}`;

                return (
                  <tr key={result.color}>
                    <th scope="row" className="color-label">
                      <span className={`gem-color-dot ${colorClass}`} aria-hidden="true" />
                      {result.color}
                    </th>
                    <td className={`table-number profit-value ${profitClass}`}>{formatChaos(result.expectedProfit)}</td>
                    <td className="table-number">
                      <span title={valueTooltip} className={valueTooltip ? 'value-help' : undefined}>
                        {formatChaos(result.expectedValue)}
                      </span>
                    </td>
                    <td className="table-number input-value">
                      <span title={costTooltip} className={costTooltip ? 'value-help' : undefined}>
                        {formatChaos(result.inputCost)}
                      </span>
                    </td>
                    <td className="table-number pool-count">{result.gemCount}</td>
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
