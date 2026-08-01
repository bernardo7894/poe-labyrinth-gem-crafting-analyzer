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
  if (!active) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon sort-icon--active">{direction === 'asc' ? '↑' : '↓'}</span>;
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
    { key: 'name', label: 'Base gem' },
    { key: 'expectedProfit', label: 'Expected profit', className: 'table-number' },
    { key: 'avgTransfiguredValue', label: 'Expected value', className: 'table-number' },
    { key: 'outcomeCount', label: 'Outcomes', className: 'table-number' },
  ];

  return (
    <DashboardCard eyebrow="B · RANDOM BY BASE GEM" title="Best base gems for a random transfigure" className="analysis-card analysis-card--featured">
      <div className="featured-card__intro">
        <p className="card-description">
          Transform a non-Transfigured Skill Gem into a random Transfigured version. Results are grouped by the ordinary base gem you put into the craft.
        </p>
        <span className="lilly-badge"><span>✦</span> LILLY INPUT · 0 C</span>
      </div>
      <p className="card-note">Hover over an expected value to see the five most valuable possible outcomes.</p>
      <div className="table-frame">
        <table className="data-table data-table--gems">
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
            {visibleData.map((gem) => {
              const valueTooltip = gem.priciestGems.length > 0 ? formatTooltip(gem.priciestGems) : undefined;
              return (
                <tr key={gem.id}>
                  <th scope="row" className="gem-name-cell">
                    <span className="gem-rank">{sortedData.indexOf(gem) + 1}</span>
                    {gem.icon && <img src={gem.icon} alt="" className="gem-icon" />}
                    <span>{gem.name}</span>
                  </th>
                  <td className="table-number profit-value profit-value--positive">{formatChaos(gem.expectedProfit)}</td>
                  <td className="table-number">
                    <span title={valueTooltip} className={valueTooltip ? 'value-help' : undefined}>
                      {formatChaos(gem.avgTransfiguredValue)}
                    </span>
                  </td>
                  <td className="table-number pool-count">{gem.outcomeCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length > TOP_RESULTS && (
        <div className="table-footer">
          <span>{showAll ? `Showing all ${data.length} eligible base gems` : `Showing the top ${TOP_RESULTS} of ${data.length} eligible base gems`}</span>
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="table-toggle"
          >
            {showAll ? 'Show top 20' : 'Show all'}
          </button>
        </div>
      )}
    </DashboardCard>
  );
};
