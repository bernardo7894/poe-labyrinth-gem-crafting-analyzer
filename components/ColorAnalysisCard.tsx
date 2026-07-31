
import React from 'react';
import { DashboardCard } from './DashboardCard';
import { ColorAnalysisResult } from '../types';

interface ColorAnalysisCardProps {
  data: ColorAnalysisResult[];
}

const TrophyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${color}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 002 14v4a1 1 0 001 1h14a1 1 0 001-1v-4a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM8 8a2 2 0 114 0v3a2 2 0 11-4 0V8z" />
  </svg>
);

const getRankColor = (index: number) => {
  switch (index) {
    case 0: return { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', trophy: 'text-yellow-400' };
    case 1: return { bg: 'bg-gray-400/10', border: 'border-gray-400', text: 'text-gray-300', trophy: 'text-gray-400' };
    case 2: return { bg: 'bg-orange-600/10', border: 'border-orange-600', text: 'text-orange-500', trophy: 'text-orange-500' };
    default: return { bg: 'bg-gray-700/20', border: 'border-gray-700', text: 'text-gray-400', trophy: 'text-gray-500' };
  }
};

export const ColorAnalysisCard: React.FC<ColorAnalysisCardProps> = ({ data }) => {
  return (
    <DashboardCard title="Best Color for Random Transfigure">
      <div className="space-y-4">
        <p className="text-sm text-gray-400 mb-4">
          Analyzes the profit from using "Transform a Skill Gem to be a random Transfigured Gem of the same colour".
        </p>
        {data.map((result, index) => {
          const rankColors = getRankColor(index);
          const profitColor = result.expectedProfit > 0 ? 'text-green-400' : 'text-red-400';

          return (
            <div key={result.color} className={`p-4 rounded-lg border ${rankColors.bg} ${rankColors.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrophyIcon color={rankColors.trophy} />
                  <span className={`text-xl font-semibold ${rankColors.text}`}>{result.color} Gems</span>
                </div>
                <div className={`text-lg font-bold ${profitColor}`}>
                  {result.expectedProfit.toFixed(2)} c
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                <span>Expected Value:</span><span className="text-right text-gray-300">{result.expectedValue.toFixed(2)} c</span>
                <span>Avg. Input Cost:</span><span className="text-right text-gray-300">{result.inputCost.toFixed(2)} c</span>
                <span>Pool Size:</span><span className="text-right text-gray-300">{result.gemCount} gems</span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};
