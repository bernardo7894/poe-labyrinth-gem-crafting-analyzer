import { useEffect, useState } from 'react';
import { fetchAndProcessGemData } from '../services/poeService';
import { analyzeGemData } from '../services/gemAnalysis';
import { CORRUPTED_VARIANTS, GemAnalyses } from '../types';

const emptyAnalyses: GemAnalyses = {
  randomUncorruptedByColor: [],
  specificTransfigure: [],
  randomCorruptedTransfiguredByColor: Object.fromEntries(
    CORRUPTED_VARIANTS.map((variant) => [variant, []]),
  ) as GemAnalyses['randomCorruptedTransfiguredByColor'],
  randomCorruptedBaseByColor: Object.fromEntries(
    CORRUPTED_VARIANTS.map((variant) => [variant, []]),
  ) as GemAnalyses['randomCorruptedBaseByColor'],
};

export const useGemData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [league, setLeague] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<GemAnalyses>(emptyAnalyses);

  useEffect(() => {
    let active = true;

    const loadAndAnalyze = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAndProcessGemData();
        const nextAnalyses = analyzeGemData(result.gems);

        if (!active) return;
        setLeague(result.league);
        setAnalyses(nextAnalyses);
      } catch (caughtError: unknown) {
        if (!active) return;
        if (caughtError instanceof Error) {
          setError(caughtError.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAndAnalyze();
    return () => {
      active = false;
    };
  }, []);

  return { loading, error, league, analyses };
};
