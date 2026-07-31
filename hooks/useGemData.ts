
import { useState, useEffect } from 'react';
import { fetchAndProcessGemData } from '../services/poeService';
import { ProcessedGem, ColorAnalysisResult, IndividualGemAnalysisResult } from '../types';

export const useGemData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [league, setLeague] = useState<string | null>(null);
  const [colorAnalysis, setColorAnalysis] = useState<ColorAnalysisResult[]>([]);
  const [individualGemAnalysis, setIndividualGemAnalysis] = useState<IndividualGemAnalysisResult[]>([]);

  useEffect(() => {
    const analyzeData = async () => {
      try {
        setLoading(true);
        const result = await fetchAndProcessGemData();
        setLeague(result.league);
        const processedData = result.gems;

        // --- Analysis 1: Transform by Color ---
        const colors: ('Red' | 'Green' | 'Blue')[] = ['Red', 'Green', 'Blue'];
        const colorResults: ColorAnalysisResult[] = colors.map(color => {
          const transfiguredGemsOfColor = processedData.filter(g => g.isTransfigured && g.color === color);
          if (transfiguredGemsOfColor.length === 0) {
            return { color, expectedValue: 0, inputCost: 0, expectedProfit: 0, gemCount: 0 };
          }
          const totalValue = transfiguredGemsOfColor.reduce((sum, gem) => sum + gem.chaosValue, 0);
          const expectedValue = totalValue / transfiguredGemsOfColor.length;

          const allGemsOfColor = processedData.filter(g => g.color === color);
          const inputCost = Math.min(...allGemsOfColor.map(g => g.chaosValue).filter(v => v > 0));

          return {
            color,
            expectedValue,
            inputCost,
            expectedProfit: expectedValue - inputCost,
            gemCount: transfiguredGemsOfColor.length,
          };
        });
        setColorAnalysis(colorResults.sort((a, b) => b.expectedProfit - a.expectedProfit));


        // --- Analysis 2: Transform Specific Gem ---
        const gemGroups = new Map<string, { normal?: ProcessedGem; transfigured: ProcessedGem[] }>();
        processedData.forEach(gem => {
          if (!gemGroups.has(gem.baseName)) {
            gemGroups.set(gem.baseName, { transfigured: [] });
          }
          const group = gemGroups.get(gem.baseName)!;
          if (gem.isTransfigured) {
            group.transfigured.push(gem);
          } else {
            group.normal = gem;
          }
        });

        const individualResults: IndividualGemAnalysisResult[] = [];
        gemGroups.forEach((group) => {
          if (group.normal && group.transfigured.length > 0) {
            const totalTransfiguredValue = group.transfigured.reduce((sum, gem) => sum + gem.chaosValue, 0);
            const avgTransfiguredValue = totalTransfiguredValue / group.transfigured.length;

            individualResults.push({
              id: group.normal.detailsId,
              name: group.normal.name,
              icon: group.normal.icon,
              inputCost: group.normal.chaosValue,
              transfiguredVersions: group.transfigured,
              avgTransfiguredValue,
              expectedProfit: avgTransfiguredValue - group.normal.chaosValue,
            });
          }
        });

        setIndividualGemAnalysis(individualResults.sort((a, b) => b.expectedProfit - a.expectedProfit));

      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, error, league, colorAnalysis, individualGemAnalysis };
};
