import {
  CORRUPTED_VARIANTS,
  ColorAnalysisResult,
  CorruptedVariant,
  GemAnalyses,
  GemPriceEntry,
  GemColor,
  IndividualGemAnalysisResult,
  ProcessedGem,
} from '../types';

const COLORS: GemColor[] = ['Red', 'Green', 'Blue'];

const filterGems = (
  gems: ProcessedGem[],
  level: number,
  quality: number,
  corrupted: boolean,
): ProcessedGem[] => gems.filter((gem) => (
  gem.gemLevel === level
  && (gem.gemQuality ?? 0) === quality
  && (gem.corrupted === true) === corrupted
));

const isVaalGem = (gem: ProcessedGem): boolean => (
  gem.name.startsWith('Vaal ')
  || gem.baseType?.startsWith('Vaal ') === true
);

const getChaosValue = (gem: ProcessedGem): number => (
  Number.isFinite(gem.chaosValue) ? gem.chaosValue : 0
);

const getPriceEntries = (pool: ProcessedGem[], descending: boolean): GemPriceEntry[] => (
  [...pool]
    .sort((a, b) => descending
      ? getChaosValue(b) - getChaosValue(a)
      : getChaosValue(a) - getChaosValue(b))
    .slice(0, 5)
    .map((gem) => ({ name: gem.name, chaosValue: getChaosValue(gem) }))
);

const analyzeColorPool = (
  gems: ProcessedGem[],
  inputIsFree: boolean,
): ColorAnalysisResult[] => COLORS.flatMap((color) => {
  const pool = gems.filter((gem) => gem.color === color);
  if (pool.length === 0) return [];

  const expectedValue = pool.reduce((sum, gem) => sum + getChaosValue(gem), 0) / pool.length;
  const cheapestGems = inputIsFree ? [] : getPriceEntries(pool, false);
  const inputCost = inputIsFree ? 0 : (cheapestGems[0]?.chaosValue ?? 0);

  return {
    color,
    expectedValue,
    inputCost,
    expectedProfit: expectedValue - inputCost,
    gemCount: pool.length,
    cheapestGems,
    priciestGems: getPriceEntries(pool, true),
  };
}).sort((a, b) => b.expectedProfit - a.expectedProfit);

const analyzeSpecificTransfigure = (gems: ProcessedGem[]): IndividualGemAnalysisResult[] => {
  const filtered = filterGems(gems, 1, 0, false);
  const groups = new Map<string, ProcessedGem[]>();

  filtered.forEach((gem) => {
    if (isVaalGem(gem)) return;

    if (!gem.isTransfigured) return;

    const group = groups.get(gem.baseName) ?? [];
    group.push(gem);
    groups.set(gem.baseName, group);
  });

  return [...groups.entries()]
    .filter(([, outcomes]) => outcomes.length > 1)
    .map(([baseName, group]) => {
      const avgTransfiguredValue = group.reduce(
        (sum, gem) => sum + getChaosValue(gem),
        0,
      ) / group.length;

      return {
        id: baseName,
        name: baseName,
        icon: group[0]?.icon ?? '',
        outcomeCount: group.length,
        avgTransfiguredValue,
        // Lilly provides the normal input gem, so its market price is not
        // subtracted from this craft's expected return.
        expectedProfit: avgTransfiguredValue,
        priciestGems: getPriceEntries(group, true),
      };
    })
    .sort((a, b) => b.expectedProfit - a.expectedProfit);
};

const getCorruptedVariant = (variant: CorruptedVariant): { level: number; quality: number } => {
  const [level, quality] = variant.split('/').map(Number);
  return { level, quality };
};

const analyzeCorruptedTransfiguredByColor = (
  gems: ProcessedGem[],
  variant: CorruptedVariant,
): ColorAnalysisResult[] => {
  const { level, quality } = getCorruptedVariant(variant);
  const filtered = filterGems(gems, level, quality, true).filter((gem) => (
    gem.isTransfigured
    && !isVaalGem(gem)
    && gem.color !== 'White'
  ));

  return analyzeColorPool(filtered, false);
};

const analyzeCorruptedBaseByColor = (
  gems: ProcessedGem[],
  variant: CorruptedVariant,
): ColorAnalysisResult[] => {
  const { level, quality } = getCorruptedVariant(variant);
  const filtered = filterGems(gems, level, quality, true).filter((gem) => (
    !gem.isTransfigured
    && !isVaalGem(gem)
    && gem.color !== 'White'
  ));

  return analyzeColorPool(filtered, false);
};

export const analyzeGemData = (gems: ProcessedGem[]): GemAnalyses => {
  const uncorrupted = filterGems(gems, 1, 0, false);
  const uncorruptedTransfigured = uncorrupted.filter((gem) => (
    gem.isTransfigured
    && !isVaalGem(gem)
    && gem.color !== 'White'
  ));

  const randomCorruptedTransfiguredByColor = {} as Record<CorruptedVariant, ColorAnalysisResult[]>;
  const randomCorruptedBaseByColor = {} as Record<CorruptedVariant, ColorAnalysisResult[]>;

  CORRUPTED_VARIANTS.forEach((variant) => {
    randomCorruptedTransfiguredByColor[variant] = analyzeCorruptedTransfiguredByColor(gems, variant);
    randomCorruptedBaseByColor[variant] = analyzeCorruptedBaseByColor(gems, variant);
  });

  return {
    randomUncorruptedByColor: analyzeColorPool(uncorruptedTransfigured, true),
    specificTransfigure: analyzeSpecificTransfigure(gems),
    randomCorruptedTransfiguredByColor,
    randomCorruptedBaseByColor,
  };
};
