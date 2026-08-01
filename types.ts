export type GemColor = 'Red' | 'Green' | 'Blue';

// Raw data structure from the poe.ninja economy API.
export interface PoeNinjaGem {
  id: number;
  name: string;
  icon: string;
  baseType?: string;
  levelRequired?: number;
  variant?: string;
  corrupted?: boolean;
  gemLevel?: number;
  gemQuality?: number;
  chaosValue: number;
  divineValue: number;
  detailsId: string;
}

export interface ProcessedGem extends PoeNinjaGem {
  color: GemColor | 'White';
  isTransfigured: boolean;
  baseName: string;
}

export interface GemPriceEntry {
  name: string;
  chaosValue: number;
}

export interface ColorAnalysisResult {
  color: GemColor;
  expectedValue: number;
  inputCost: number;
  expectedProfit: number;
  gemCount: number;
  cheapestGems: GemPriceEntry[];
  priciestGems: GemPriceEntry[];
}

export interface IndividualGemAnalysisResult {
  id: string;
  name: string;
  icon: string;
  outcomeCount: number;
  avgTransfiguredValue: number;
  expectedProfit: number;
  priciestGems: GemPriceEntry[];
}

// The corrupted crafts are only useful for already-levelled gems. A 1/0
// corrupted input is not a practical Labyrinth craft, so it is not exposed
// in the analyzer UI or included in the analysis set.
export const CORRUPTED_VARIANTS = ['21/20', '21/23'] as const;

export type CorruptedVariant = typeof CORRUPTED_VARIANTS[number];

export interface GemAnalyses {
  randomUncorruptedByColor: ColorAnalysisResult[];
  specificTransfigure: IndividualGemAnalysisResult[];
  randomCorruptedTransfiguredByColor: Record<CorruptedVariant, ColorAnalysisResult[]>;
  randomCorruptedBaseByColor: Record<CorruptedVariant, ColorAnalysisResult[]>;
}
